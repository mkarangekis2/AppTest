// Integration point: replace this with real embedding provider calls (OpenAI/Anthropic) when enabled.
export function generatePseudoEmbedding(text: string, length = 24): number[] {
  const vector = new Array<number>(length).fill(0);
  if (!text) {
    return vector;
  }

  for (let i = 0; i < text.length; i += 1) {
    const slot = i % length;
    vector[slot] += text.charCodeAt(i) / 255;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const max = Math.min(a.length, b.length);
  if (max === 0) return 0;

  let dot = 0;
  let an = 0;
  let bn = 0;

  for (let i = 0; i < max; i += 1) {
    dot += a[i] * b[i];
    an += a[i] * a[i];
    bn += b[i] * b[i];
  }

  const denom = Math.sqrt(an) * Math.sqrt(bn);
  return denom ? dot / denom : 0;
}
