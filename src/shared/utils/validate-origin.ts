import * as crypto from 'crypto';
import { RequestHeaders } from '@/shared/types/headers.type';

function extractSignatureParts(signature: string): {
  ts: string | null;
  hash: string | null;
} {
  let ts: string | null = null;
  let hash: string | null = null;

  signature.split(',').forEach((part) => {
    const [key, value] = part.split('=').map((s) => s.trim());
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  });

  return { ts, hash };
}

export function validateOrigin(
  headers: RequestHeaders,
  dataID: string,
  secret: string
): boolean {
  const signatureHeader = headers['X-Signature'];
  const requestId = headers['X-Request-Id'];

  if (!signatureHeader || !requestId || !dataID) {
    throw new Error('unknown origin');
  }

  const { ts, hash } = extractSignatureParts(signatureHeader);

  if (!ts || !hash) {
    throw new Error('unknown origin');
  }

  const manifest = `id:${dataID};request-id:${requestId};ts:${ts};`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const generatedHash = hmac.digest('hex');

  const expectedBuffer = Buffer.from(generatedHash, 'utf8');
  const receivedBuffer = Buffer.from(hash, 'utf8');

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error('unknown origin');
  }

  return true;
}
