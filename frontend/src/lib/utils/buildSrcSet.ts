/**
 * Generate a srcSet string only for Unsplash URLs that support width params.
 * Returns undefined for data: URLs, non-Unsplash URLs, or empty strings —
 * the browser will fall back to the plain `src` attribute.
 */
export function buildSrcSet(url: string, widths: number[]): string | undefined {
  if (!url || url.startsWith('data:') || !url.includes('unsplash.com')) {
    return undefined;
  }
  return widths.map((w) => `${url}&w=${w} ${w}w`).join(', ');
}
