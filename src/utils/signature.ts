import { stringToU8a } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";
import { waitReady } from "@polkadot/wasm-crypto";

interface Verification {
  verified: boolean;
  error?: string;
}

export async function verify(
  ss58: string,
  signature: string,
  uuid: string,
  body: string,
  timestamp: string,
  signedBy: string,
): Promise<Verification> {
  const timestampNumber: number = parseInt(timestamp, 10);
  if (isNaN(timestampNumber)) {
    return { verified: false, error: "Invalid timestamp" };
  }

  const requestTimestamp = new Date(timestampNumber * 1000);
  const now = new Date();
  const timeDelta = 8000;

  if (now.getTime() - requestTimestamp.getTime() > timeDelta) {
    return { verified: false, error: "Timestamp is too old" };
  }

  const bodyHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );

  const bodyHashHex = Array.from(new Uint8Array(bodyHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const parsedSignature = signature.startsWith("0x")
    ? signature.slice(2)
    : signature;
  const signatureBytes = stringToU8a(parsedSignature);

  const message = `${bodyHashHex}.${uuid}.${timestamp}.${ss58}`;
  await waitReady();
  const messageBytes = stringToU8a(message);
  const { isValid } = signatureVerify(messageBytes, signatureBytes, signedBy);
  if (!isValid) return { verified: false, error: "Invalid signature" };

  return { verified: true };
}

export function getEpistulaHeaders(headers: Headers) {
  const signature = headers.get("Epistula-Request-Signature");
  if (!signature) throw new Error("Signature not found");

  const uuid = headers.get("Epistula-Uuid");
  if (!uuid) throw new Error("UUID not found");

  const timestamp = headers.get("Epistula-Timestamp");
  if (!timestamp) throw new Error("Timestamp not found");

  const signedFor = headers.get("Epistula-Signed-For");
  if (!signedFor) throw new Error("Signed for not found");

  const signedBy = headers.get("Epistula-Signed-By");
  if (!signedBy) throw new Error("Signed by not found");

  return { signature, uuid, timestamp, signedFor, signedBy };
}
