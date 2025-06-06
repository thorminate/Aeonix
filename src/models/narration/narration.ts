import { ChannelResolvable, TextChannel } from "discord.js";
import Environment from "../environment/environment.js";
import aeonix from "../../aeonix.js";
import Player from "../player/player.js";

type FullChannelResolvable = ChannelResolvable | Environment | Player;

export default class Narration {
  channel: TextChannel;
  message: string;

  constructor(msg: string, resolvable: FullChannelResolvable) {
    let result;
    if (resolvable instanceof Environment) {
      result = aeonix.channels.cache.get(resolvable.channelId);
    } else if (resolvable instanceof Player) {
      result = aeonix.channels.cache.get(resolvable.locationChannelId);
    } else {
      result = aeonix.channels.resolve(resolvable);
    }

    if (result && result instanceof TextChannel) {
      this.channel = result as TextChannel;
    } else {
      throw new Error("Could not resolve narration channel.");
    }

    this.message = msg;
  }

  async send() {
    await this.channel.send(this.message);
  }
}
