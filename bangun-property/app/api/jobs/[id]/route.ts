import { NextRequest, NextResponse } from "next/server";
import { getJob, jobToDTO } from "@/lib/services/job-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/jobs/:id  → poll job status/progress
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: "Job not found or expired" }, { status: 404 });
  }

  return NextResponse.json(jobToDTO(job));
}
