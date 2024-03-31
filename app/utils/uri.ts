export function isUriEncoded(uri: string): boolean {
  // Decode the URL using decodeURIComponent
  const decodedUri = decodeURIComponent(uri);

  // Compare the original and decoded URL
  return uri !== decodedUri;
}
