import RawPlayer from "./rawPlayer.js";

export default function isRawPlayer(data: object): data is RawPlayer {
  return data && "b" in data && "v" in data && "l" in data && "p" in data;
}
