import type { jobs } from "@/db/schema";

/**
 * Ingestion entrypoint for AI/web source jobs.
 * v1 stub: validates payload shape and logs. Wire OpenAI extract + upsert next.
 */
export async function processIngestionJob(job: typeof jobs.$inferSelect): Promise<void> {
  const sourceId = typeof job.payload.sourceId === "string" ? job.payload.sourceId : null;
  const url = typeof job.payload.url === "string" ? job.payload.url : null;

  if (!sourceId || !url) {
    throw new Error("ingest job requires payload.sourceId and payload.url");
  }

  // Intentionally no network/AI calls until sources are approved.
  console.log("[ingestion] queued extract (stub)", { jobId: job.id, sourceId, url });
}
