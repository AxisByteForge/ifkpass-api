export interface RequestHeaders {
  'X-Request-Id'?: string;
  'X-Signature'?: string;
  [key: string]: string | undefined;
}
