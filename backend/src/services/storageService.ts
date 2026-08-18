import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

export const storageService = {
  async uploadImage(folder: string, file: { buffer: Buffer; mimetype: string; originalname: string }) {
    if (!s3 || !env.STORAGE_BUCKET) {
      throw new Error('Storage is not configured');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg';
    const key = `${folder}/${randomUUID()}.${safeExtension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
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
