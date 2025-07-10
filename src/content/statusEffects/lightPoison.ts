import Player from "../../models/player/utils/player.js";
import StatusEffect from "../../models/player/utils/statusEffects/statusEffect.js";

export default class LightPoison extends StatusEffect {
  type = "lightPoison";
  name = "Light Poison";
  description = "You feel a bit nauseous. You might want to sit down.";
  duration = 5; // Duration in turns
  isPermanent = false;

  override onEffectStart(player: Player): Player {
    player.stats.hasNausea = true;
    return player;
  }

  override onEffectTick(player: Player): Player {
    // Optionally, you can add logic for each tick of the effect
    return player;
  }

  override onEffectEnd(player: Player): Player {
    player.stats.hasNausea = false;
    return player;
  }
}
