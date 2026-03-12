export function chunkText(input: string, maxChars = 700): string[] {
  const text = input.trim();
  if (!text) return [];

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const slice = text.slice(cursor, cursor + maxChars);
    const boundary = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("\n"), slice.lastIndexOf(" "));
    const cut = boundary > maxChars * 0.55 ? boundary + 1 : slice.length;
    chunks.push(slice.slice(0, cut).trim());
    cursor += cut;
  }

  return chunks.filter(Boolean);
}
