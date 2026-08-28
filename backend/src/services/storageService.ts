import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import { randomUUID } from 'crypto';

const storageEnabled =
  env.STORAGE_ENDPOINT &&
  env.STORAGE_BUCKET &&
  env.STORAGE_ACCESS_KEY &&
  env.STORAGE_SECRET_KEY;

const s3 = storageEnabled
  ? new S3Client({
      region: env.STORAGE_REGION,
      endpoint: env.STORAGE_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY!,
        secretAccessKey: env.STORAGE_SECRET_KEY!,
      },
    })
  : null;

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Path prefix of the re-signing proxy in app.ts. */
export const MEDIA_PROXY_PREFIX = '/api/media/';

const getSignedObjectUrl = async (key: string) => {
  if (!s3 || !env.STORAGE_BUCKET) {
    return key;
  }

  const command = new GetObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_TTL_SECONDS });
};

/**
 * A URL safe to persist in the database.
 *
 * Always points at our own re-signing proxy, for two reasons:
 *
 *  - Presigned URLs expire (an hour here), so persisting one means the image
 *    404s the next day.
 *  - The bucket is usually NOT publicly readable. Pointing straight at
 *    STORAGE_PUBLIC_URL only works when public-read is actually enabled on the
 *    bucket; when it is not, every image silently 403s. The proxy re-signs on
 *    each request, so it works either way.
 *
 * The path is relative and host-free, so it survives a domain change. Clients
 * resolve it against the API origin.
 */
const stableUrlForKey = (key: string): string =>
  `${MEDIA_PROXY_PREFIX}${key.split('/').map(encodeURIComponent).join('/')}`;

/**
 * Recover the object key from a URL we previously handed out.
 *
 * Rows written before stable URLs existed hold an expired presigned URL; its
 * path still contains the key, so those images can be healed on read instead
 * of being lost.
 */
const keyFromStoredUrl = (value: string): string | null => {
  if (!value) return null;

  if (value.startsWith(MEDIA_PROXY_PREFIX)) {
    return decodeURIComponent(value.slice(MEDIA_PROXY_PREFIX.length));
  }

  if (env.STORAGE_PUBLIC_URL && value.startsWith(env.STORAGE_PUBLIC_URL)) {
    return decodeURIComponent(value.slice(env.STORAGE_PUBLIC_URL.replace(/\/+$/, '').length + 1));
  }

  // A presigned (or plain) S3 URL: strip the origin, the bucket segment and
  // any query string, leaving the key.
  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      let path = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if (env.STORAGE_BUCKET && path.startsWith(`${env.STORAGE_BUCKET}/`)) {
        path = path.slice(env.STORAGE_BUCKET.length + 1);
      }
      return path || null;
    } catch {
      return null;
    }
  }

  return null;
};

/** True for values we should leave completely alone (data URLs, other hosts). */
const isForeignUrl = (value: string): boolean => {
  if (value.startsWith('data:')) return true;
  if (!/^https?:\/\//.test(value)) return false;
  if (env.STORAGE_PUBLIC_URL && value.startsWith(env.STORAGE_PUBLIC_URL)) return false;
  if (!env.STORAGE_ENDPOINT) return true;
  try {
    return new URL(value).host !== new URL(env.STORAGE_ENDPOINT).host;
  } catch {
    return true;
  }
};

/** Longest edge kept for stored images; enough for a full-bleed hero on retina. */
const MAX_IMAGE_EDGE = 1600;
const IMAGE_QUALITY = 80;

/**
 * Downscale and re-encode an upload to WebP.
 *
 * `.rotate()` with no argument applies the EXIF orientation and then drops the
 * tag, so portrait phone photos do not come back sideways once metadata is
 * stripped. Animated GIFs pass through untouched — re-encoding kills the
 * animation — as does anything sharp cannot decode.
 */
async function normaliseImage(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<{
  body: Buffer;
  contentType: string;
  extension: string;
}> {
  const fallbackExtension =
    (file.originalname.split('.').pop()?.toLowerCase() || 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg';

  if (file.mimetype === 'image/gif' || !file.mimetype.startsWith('image/')) {
    return { body: file.buffer, contentType: file.mimetype, extension: fallbackExtension };
  }

  try {
    const body = await sharp(file.buffer)
      .rotate()
      .resize(MAX_IMAGE_EDGE, MAX_IMAGE_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer();
    return { body, contentType: 'image/webp', extension: 'webp' };
  } catch {
    return { body: file.buffer, contentType: file.mimetype, extension: fallbackExtension };
  }
}

/** Rough byte length of a base64 payload, without decoding it. */
function base64Bytes(b64: string): number {
  return Math.floor((b64.length * 3) / 4);
}

export const storageService = {
  /**
   * Turns a `data:` image URI into a stored file and returns its key.
   *
   * Image fields are plain strings, so a client could put an entire encoded
   * image in one — and one did: a single vendor's cover image was 1.5MB of
   * base64 inlined into every directory response, which every visitor on
   * mobile data paid for. Converting on write keeps the column holding a
   * reference rather than a payload.
   *
   * Returns null for anything that is not a data URI, so callers can pass
   * ordinary URLs straight through.
   */
  async storeDataUri(folder: string, value: string | null | undefined): Promise<string | null> {
    if (!value || !value.startsWith('data:')) return null;

    const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(value);
    if (!match) return null;

    const [, mimetype, isBase64, payload] = match;
    if (!mimetype.startsWith('image/')) return null;

    // Guard before allocating: a malformed or hostile URI should not be
    // decoded into memory first.
    if (isBase64 && base64Bytes(payload) > 12 * 1024 * 1024) {
      throw Object.assign(new Error('That image is too large. Please use one under 12MB.'), {
        statusCode: 400,
      });
    }

    const buffer = isBase64
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8');

    const { key } = await this.uploadImage(folder, {
      buffer,
      mimetype,
      originalname: `upload.${mimetype.split('/')[1] || 'jpg'}`,
    });
    return key;
  },

  async uploadImage(folder: string, file: { buffer: Buffer; mimetype: string; originalname: string }) {
    if (!s3 || !env.STORAGE_BUCKET) {
      throw new Error('Storage is not configured');
    }

    // Phone cameras produce 3-8MB files; served straight back they dominate page
    // weight. Every upload route funnels through here, so normalising once
    // covers all of them.
    const { body, contentType, extension } = await normaliseImage(file);
    const key = `${folder}/${randomUUID()}.${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );

    return { key, url: stableUrlForKey(key) };
  },

  async uploadVendorImage(userId: string, file: { buffer: Buffer; mimetype: string; originalname: string }) {
    return this.uploadImage(`vendors/${userId}`, file);
  },

  async getSignedUrl(key: string) {
    return getSignedObjectUrl(key);
  },

  /** Fetch an object so the proxy can stream it back to the browser. */
  async getObject(key: string) {
    if (!s3 || !env.STORAGE_BUCKET) {
      throw new Error('Storage is not configured');
    }
    return s3.send(new GetObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: key }));
  },

  stableUrlForKey,
  keyFromStoredUrl,
  isForeignUrl,

  /**
   * Normalise a persisted image URL for display. Converts legacy presigned
   * URLs into non-expiring ones and passes external/data URLs through.
   */
  toStableUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    if (isForeignUrl(value)) return value;
    if (value.startsWith(MEDIA_PROXY_PREFIX)) return value;
    const key = keyFromStoredUrl(value);
    return key ? stableUrlForKey(key) : value;
  },

  get isConfigured() {
    return Boolean(s3 && env.STORAGE_BUCKET);
  },
};
