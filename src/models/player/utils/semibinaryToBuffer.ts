import { Binary } from "mongodb";

export default function semibinaryToBuffer(binary: Binary | Buffer): Buffer {
  return binary instanceof Buffer
    ? binary
    : Buffer.from(binary.buffer as ArrayBuffer);
}
