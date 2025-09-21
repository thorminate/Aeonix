import RawPlayer from "./rawPlayer.js";

export default function isRawPlayer(data: object): data is RawPlayer {
  return data && 0 in data && 1 in data && 2 in data && 3 in data;
}
