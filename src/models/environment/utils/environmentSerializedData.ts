import { SerializedData } from "../../core/serializable.js";

type EnvironmentSerializedData = SerializedData & { type: string };

export default EnvironmentSerializedData;
