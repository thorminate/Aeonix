import StatusEffect from "#player/utils/statusEffects/statusEffect.js";

export default class StatusEffectTemplate extends StatusEffect {
  type = "#statusEffectTemplate"; // should always be the exact same as the filename
  name = "Status Effect Template";
  description = "A placeholder status effect.";
  duration = 5; // Duration in turns
  isPermanent = false;

  onEffectStart() {}

  onEffectTick() {} // Optionally, you can add logic for each game tick while the status effect is active

  onEffectEnd() {}

  onEvent() {}
}
