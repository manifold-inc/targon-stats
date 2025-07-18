import { NextResponse } from "next/server";

import { connectToMongoDb } from "@/schema/mongoDB";
import { getEpistulaHeaders, verify } from "@/utils/signature";

interface AttestationReport {
  failed: Record<string, string>;
}

export async function getAttestationErrors(uid: string) {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) throw new Error("Failed to connect to MongoDB");

  const data = await mongoDb
    .collection("miner_info")
    .find({}, { projection: { attest_errors: 1, _id: 0 } })
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) throw new Error("Failed to get attestation report");

  const failed = data[0].attest_errors as Record<
    string,
    Record<string, string>
  >;

  const report: AttestationReport = {
    failed: failed[uid] || {},
  };

  return report;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  try {
    if (!id) throw new Error("No id provided");
    if (!request.body) throw new Error("No body provided");
    const body = await request.text();

    const headers = getEpistulaHeaders(request.headers);
    const { verified, error } = await verify(
      headers.signedBy,
      headers.signature,
      headers.uuid,
      body,
      headers.timestamp,
      headers.signedBy,
    );
    if (!verified) throw new Error(error);

    const report = await getAttestationErrors(id);
    return NextResponse.json(
      { success: true, data: report, timestamp: new Date().toISOString() },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: { message, code: "INTERNAL_ERROR", statusCode: 500 },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
