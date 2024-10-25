// on event messageCreate, do this
import { Client, Message } from "discord.js";
import userData from "../../models/userDatabaseSchema";
import calculateLevelExp from "../../utils/calculateLevelExp";
import actions from "../../actions/actionIndex";
import log from "../../utils/log";
const cooldowns = new Set();

// gets random number based on set parameters min and max
function getRandomExp(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async (bot: Client, message: Message) => {
  // if message was not made in a guild, author was a bot or the cooldown is active, return
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  // gets random number based on set parameters min and max
  const expToGive = getRandomExp(5, 15);

  try {
    // gets user from userData
    const user = await userData.findOne({
      id: message.author.id,
      guild: message.guild.id,
    });

    // if userData(aka level) exists in database, check cooldown and give exp to user.
    if (user) {
      if (cooldowns.has(message.author.id)) {
        return;
      }
      user.exp += expToGive;

      // if user has gained enough exp to level up, level up and say so to user.
      if (user.exp > calculateLevelExp(user.level)) {
        await actions.user.levelUp(user);

        const botMessage = await message.reply({
          content: `Hello, <@${message.member.id}>! you have leveled up!\nPlease check your status menu for your new stats!`,
        });
        setTimeout(() => {
          botMessage.delete();
        }, 60 * 1000);
      } else {
        await user.save();
      }

      // set cooldown to 60 seconds
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 100);

      // if user doesn't exist in database, create it and give exp to user.
    } else {
      const newUser = new userData({
        id: message.author.id,
        guild: message.guild.id,
        name: message.author.username,
        exp: expToGive,
      });

      // then send a notice that the persona was not saved in the database.
      if (message.member.roles.cache.has("1270791621289578607")) {
        await message.member.roles.remove("1270791621289578607");
        await message.channel.send(
          `Hello, <@${message.member.id}> your persona was not saved in the database. Your player role has been revoked. Head over to <#1270790941892153404> to set your persona back!`
        );
      }
      // save new userData(aka level)
      await newUser.save();
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.log(`Error giving Exp: ${error}`);
    log({
      header: "Error giving Exp",
      payload: `${error}`,
      type: "error",
    });
  }
};
