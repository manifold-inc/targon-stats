import { NextResponse } from "next/server";

import { connectToMongoDb } from "@/schema/mongoDB";
import { getEpistulaHeaders, verify } from "@/utils/signature";

interface AttestationReport {
  failed: Record<string, string>;
  hotkey_to_uid: Record<string, string>;
}

async function getAttestationErrors(
  uid: string,
): Promise<[AttestationReport, null] | [null, string]> {
  const mongoDb = await connectToMongoDb();
  if (!mongoDb) {
    return [null, "Failed to connect to MongoDB"];
  }

  const data = await mongoDb
    .collection("miner_info")
    .find({}, { projection: { attest_errors: 1, _id: 0, hotkey_to_uid: 1 } })
    .sort({ block: -1 })
    .limit(1)
    .toArray();
  if (!data[0]) {
    return [null, "Failed to get attestation report"];
  }

  const failed = data[0].attest_errors as Record<
    string,
    Record<string, string>
  >;

  const hotkeytouid = data[0].hotkey_to_uid as Record<string, string>;

  const report: AttestationReport = {
    failed: failed[uid] || {},
    hotkey_to_uid: hotkeytouid,
  };

  return [report, null];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  try {
    if (!id) throw new Error("No id provided");
    let headers;
    try {
      headers = getEpistulaHeaders(request.headers);
    } catch (e) {
      console.log(e);
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }
    const { verified, error } = await verify(
      headers.signedBy,
      headers.signature,
      headers.uuid,
      "",
      headers.timestamp,
      headers.signedFor,
    );
    if (!verified) {
      console.log(error);
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }

    const [report, err] = await getAttestationErrors(id);
    if (err || report === null) {
      console.log(error);
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }
    if (
      report.hotkey_to_uid[headers.signedBy] !== id &&
      report.hotkey_to_uid[headers.signedBy] !== "28"
    ) {
      console.log(error);
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        data: report.failed,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.log(error);
    return NextResponse.json(
      {
        error: { message, code: "INTERNAL_ERROR", statusCode: 500 },
      },
      { status: 500 },
    );
  }
}
