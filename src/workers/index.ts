import "dotenv/config";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { jobs } from "@/db/schema";
import { getDb, getSql } from "@/lib/db";
import { createId } from "@/lib/ids";
import { processIngestionJob } from "@/workers/ingestion";

const POLL_MS = Number(process.env.WORKER_POLL_MS ?? 5000);

async function claimNextJob() {
  const db = getDb();
  const now = new Date();

  const candidates = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, "PENDING"), lte(jobs.runAt, now)))
    .orderBy(asc(jobs.runAt))
    .limit(1);

  const job = candidates[0];
  if (!job) return null;

  const updated = await db
    .update(jobs)
    .set({
      status: "RUNNING",
      lockedAt: now,
      attempts: sql`${jobs.attempts} + 1`,
      updatedAt: now,
    })
    .where(and(eq(jobs.id, job.id), eq(jobs.status, "PENDING")))
    .returning();

  return updated[0] ?? null;
}

async function completeJob(id: string) {
  const db = getDb();
  await db
    .update(jobs)
    .set({ status: "COMPLETED", updatedAt: new Date(), lastError: null })
    .where(eq(jobs.id, id));
}

async function failJob(id: string, error: unknown, attempts: number, maxAttempts: number) {
  const db = getDb();
  const message = error instanceof Error ? error.message : String(error);
  const dead = attempts >= maxAttempts;

  await db
    .update(jobs)
    .set({
      status: dead ? "DEAD" : "PENDING",
      lastError: message,
      runAt: new Date(Date.now() + Math.min(30, 2 ** attempts) * 1000),
      updatedAt: new Date(),
      lockedAt: null,
    })
    .where(eq(jobs.id, id));
}

async function ensureHeartbeatJob() {
  const db = getDb();
  const existing = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.type, "heartbeat"), eq(jobs.status, "PENDING")))
    .limit(1);

  if (existing[0]) return;

  await db.insert(jobs).values({
    id: createId("job"),
    type: "heartbeat",
    payload: { note: "worker alive" },
    status: "PENDING",
    runAt: new Date(Date.now() + 60_000),
  });
}

async function handleJob(job: typeof jobs.$inferSelect) {
  if (job.type === "heartbeat") {
    console.log("[worker] heartbeat", new Date().toISOString());
    return;
  }
  if (job.type === "ingest.source" || job.type === "ingest.refresh") {
    await processIngestionJob(job);
    return;
  }
  console.warn("[worker] unknown job type", job.type);
}

async function loop() {
  console.log("[worker] started");
  await ensureHeartbeatJob();

  for (;;) {
    try {
      const job = await claimNextJob();
      if (!job) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        continue;
      }

      try {
        await handleJob(job);
        await completeJob(job.id);
        if (job.type === "heartbeat") {
          await ensureHeartbeatJob();
        }
      } catch (error) {
        console.error("[worker] job failed", job.id, error);
        await failJob(job.id, error, job.attempts + 1, job.maxAttempts);
      }
    } catch (error) {
      console.error("[worker] loop error", error);
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
  }
}

loop().catch(async (error) => {
  console.error(error);
  await getSql().end({ timeout: 5 });
  process.exit(1);
});
