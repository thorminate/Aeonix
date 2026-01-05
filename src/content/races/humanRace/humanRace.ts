import Race from "#player/utils/race/race.js";

export default class HumanRace extends Race {
  type = "humanRace"; // should always be the exact same as the filename
  name = "Human";
  description = "The most common race.";

  tags = [];
  modifiers = [];

  onEvent(): void {}
}
