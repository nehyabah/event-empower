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

const getSignedObjectUrl = async (key: string) => {
  if (!s3 || !env.STORAGE_BUCKET) {
    return key;
  }

  const command = new GetObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 60 * 60 });
};

export const storageService = {
  async uploadVendorImage(userId: string, file: { buffer: Buffer; mimetype: string; originalname: string }) {
    if (!s3 || !env.STORAGE_BUCKET) {
      throw new Error('Storage is not configured');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExtension = extension.replace(/[^a-z0-9]/g, '') || 'jpg';
    const key = `vendors/${userId}/${randomUUID()}.${safeExtension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const url = await getSignedObjectUrl(key);
    return { key, url };
  },

  async getSignedUrl(key: string) {
    return getSignedObjectUrl(key);
  },
};
