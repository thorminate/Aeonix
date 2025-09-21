import { Binary } from "mongodb";
import PlayerStorage from "./playerStorage.js";

export default function isPlayerStorage(data: object): data is PlayerStorage {
  return (
    data &&
    "p" in data &&
    (data.p instanceof Binary || data.p instanceof Buffer)
  );
}
