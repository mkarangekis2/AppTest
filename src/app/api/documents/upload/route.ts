import { requireApiUser } from "@/lib/auth";
import { parseJsonBody, jsonError } from "@/lib/http";
import { getLatestCompanyContext } from "@/lib/acg/context";
import { chunkText } from "@/lib/knowledge/chunking";
import { generatePseudoEmbedding } from "@/lib/knowledge/embeddings";

type UploadBody = {
  title?: string;
  documentType?: string;
  source?: string;
  content?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth) return jsonError("Unauthorized.", 401);

  const { supabase, user } = auth;
  const context = await getLatestCompanyContext(supabase, user.id);
  if (!context) return jsonError("No company profile found. Complete onboarding first.", 404);

  const body = await parseJsonBody<UploadBody>(request);
  const title = body.title?.trim() || "";
  const documentType = body.documentType?.trim() || "";
  const content = body.content?.trim() || "";
  const source = body.source?.trim() || "manual";

  if (!title || !documentType || !content) {
    return jsonError("title, documentType, and content are required.");
  }

  const { data: document, error: insertDocError } = await supabase
    .from("documents")
    .insert({
      company_id: context.company.id,
      title,
      document_type: documentType,
      source,
      content_text: content,
      metadata_json: body.metadata || {}
    })
    .select("id,title,document_type,created_at")
    .single();

  if (insertDocError || !document) {
    return jsonError(insertDocError?.message || "Failed to store document.", 500);
  }

  const chunks = chunkText(content);
  if (chunks.length) {
    const { error: chunkError } = await supabase.from("document_embeddings").insert(
      chunks.map((chunk, index) => ({
        document_id: document.id,
        company_id: context.company.id,
        chunk_index: index,
        content_chunk: chunk,
        embedding: generatePseudoEmbedding(chunk)
      }))
    );

    if (chunkError) {
      return jsonError(chunkError.message, 500);
    }
  }

  return Response.json({ document, chunkCount: chunks.length });
}
