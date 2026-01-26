import Keyring from "@polkadot/keyring";
import { waitReady } from "@polkadot/wasm-crypto";
import { createHash } from "crypto";

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
  signedFor: string
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

  const bodyHash = createHash("sha256").update(body).digest("hex");

  const message = `${bodyHash}.${uuid}.${timestamp}.${signedFor}`;
  await waitReady();

  const keyring = new Keyring({ type: "sr25519" });
  const keypair = keyring.addFromAddress(ss58);
  const hex = Uint8Array.from(Buffer.from(signature.slice(2), "hex"));
  const isValid = keypair.verify(message, hex, keypair.publicKey);
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

  const signedBy = headers.get("Epistula-Signed-By");
  if (!signedBy) throw new Error("Signed by not found");

  return { signature, uuid, timestamp, signedFor: signedFor ?? "", signedBy };
}
