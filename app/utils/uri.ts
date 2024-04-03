export function isUriEncoded(uri: string): boolean {
  const decodedUri = decodeURIComponent(uri);

  return uri !== decodedUri;
}
