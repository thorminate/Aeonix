import PlayerStorage from "./playerStorage.js";

export default function isPlayerStorage(data: object): data is PlayerStorage {
  return data && "inboxCompressed" in data;
}
