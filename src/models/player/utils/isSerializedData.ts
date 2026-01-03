import { SerializedData } from "../../core/serializable.js";

export default function isSerializedData(data: object): data is SerializedData {
  return (
    data &&
    "v" in data &&
    typeof data.v === "number" &&
    "d" in data &&
    typeof data.d === "object"
  );
}
