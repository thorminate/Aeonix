import Player from "#player/player.js";
import StatusEffect from "#player/utils/statusEffects/statusEffect.js";

export default class LightPoison extends StatusEffect {
  type = "lightPoison";
  name = "Light Poison";
  description = "You feel a bit nauseous. You might want to sit down.";
  duration = 5; // Duration in turns
  isPermanent = false;

  onEffectStart(player: Player) {
    player.stats.hasNausea = true;
  }

  onEffectTick(player: Player) {
    if (player.stats.health > 1) player.stats.health -= 1;
  }

  onEffectEnd(player: Player) {
    player.stats.hasNausea = false;
  }

  onEvent() {}
}
