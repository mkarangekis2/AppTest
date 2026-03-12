import { requireApiUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { cosineSimilarity, generatePseudoEmbedding } from "@/lib/knowledge/embeddings";

type EmbeddingRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content_chunk: string;
  embedding: number[];
  documents: Array<{
    title: string;
    document_type: string;
    source: string;
  }> | null;
};

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();
  if (!query) {
    return Response.json({ query, results: [] });
  }

  const { data, error } = await supabase
    .from("document_embeddings")
    .select("id,document_id,chunk_index,content_chunk,embedding,documents(title,document_type,source)")
    .eq("company_id", context.company.id)
    .limit(200);

  if (error) return jsonError(error.message, 500);

  const needle = query.toLowerCase();
  const queryVector = generatePseudoEmbedding(query);
  const rows = (data || []) as unknown as EmbeddingRow[];

  const scored = rows
    .map((row) => {
      const lexical = row.content_chunk.toLowerCase().includes(needle) ? 1 : 0;
      const semantic = cosineSimilarity(queryVector, Array.isArray(row.embedding) ? row.embedding : []);
      const score = lexical * 0.45 + semantic * 0.55;
      return {
        ...row,
        score
      };
    })
    .filter((item) => item.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      documentId: item.document_id,
      chunkIndex: item.chunk_index,
      title: item.documents?.[0]?.title || "Untitled",
      documentType: item.documents?.[0]?.document_type || "unknown",
      source: item.documents?.[0]?.source || "manual",
      excerpt: item.content_chunk,
      score: Number(item.score.toFixed(3))
    }));

  return Response.json({ query, results: scored });
}
