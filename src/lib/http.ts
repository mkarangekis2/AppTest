export async function parseJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
