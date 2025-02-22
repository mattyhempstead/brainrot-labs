import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Received webhook job status request");
  // Get and log body
  const body = await request.json();
  console.log("Body:", JSON.stringify(body, null, 2));

  const jobFailed = body.status !== "OK" || body.error !== null;

  if (jobFailed) {
    console.error("Job failed", body);
  }

  // Call webhookJobStatus mutation with appropriate status
  await api.brainrot.webhookJobStatus({
    falRequestId: body.request_id,
    status: jobFailed ? "failed" : "completed"
  });

  return NextResponse.json({ message: "Webhook received" });
}
