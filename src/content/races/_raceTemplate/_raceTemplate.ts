import Race from "../../../models/player/utils/race/race.js";

export default class RaceTemplate extends Race {
  type = "_raceTemplate"; // should always be the exact same as the filename
  name = "Template Race";
  description = "A placeholder race.";

  tags = [];
  modifiers = [];

  onEvent(): void {}
}
