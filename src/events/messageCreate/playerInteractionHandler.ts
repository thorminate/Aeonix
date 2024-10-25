import { Message, Client } from "discord.js";
import userData from "../../models/userDatabaseSchema";
import skillData from "../../models/skillDatabaseSchema";
import itemData from "../../models/itemDatabaseSchema";

export default async (bot: Client, message: Message) => {
  // if message was not made in a guild, author was a bot or the cooldown is active, return
  if (!message.inGuild() || message.author.bot) return;
  async function consumeItem(message: any, itemName: any) {
    const user = await userData.findOne({ id: message.author.id });

    if (user) {
      const itemIndex = Array.prototype.findIndex.call(
        user.inventory,
        (item: { itemName: any }) => item && item.itemName === itemName
      );
      const itemDataConsume = await itemData.findOne({ name: itemName });

      if (itemIndex > -1) {
        if (!itemDataConsume) return;
        if (
          itemDataConsume.actionType === "consume" &&
          user.inventory[itemIndex].Amount > 1
        ) {
          user.inventory[itemIndex].Amount--;
          await user.save();
        } else if (itemDataConsume.actionType === "consume") {
          user.inventory.splice(itemIndex, 1); // Remove the item from the inventory
          await user.save();
        }

        await message.reply(`Item ${itemName} consumed.`);
      } else {
        await message.reply(`Item ${itemName} not found in your inventory.`);
      }
    } else {
      await message.reply("You are not registered in Floura's database.");
    }
  }
  async function useSkill(message: any, skillName: any) {
    const user = await userData.findOne({ id: message.author.id });

    if (user) {
      if (user.skills.includes(skillName)) {
        const skill = await skillData.findOne({ name: skillName });

        if (skill) {
          // Perform the skill action here
          if (user.will < skill.will) {
            await message.reply({
              content: "You don't have enough will to use this skill.",
              ephemeral: true,
            });
            return;
          }
          const skillAction = skill.action;
          await message.reply(skillAction);
        } else if (!skillName) {
          await message.reply({
            content: "Please specify a skill to use.",
            ephemeral: true,
          });
        } else {
          await message.reply(`Skill ${skillName} not found.`);
        }
      } else {
        await message.reply(`Skill ${skillName} not found.`);
      }
    } else {
      await message.reply("You are not registered in Floura's database.");
    }
  }

  const content = message.content.trim();

  const bracketContent = content.match(/\[(.*?)\]/g);

  if (bracketContent) {
    const bracketTexts = bracketContent.map((x: string) => x.slice(1, -1));

    for (const text of bracketTexts) {
      if (text.toLowerCase().includes("consume")) {
        const itemName = text.split(" ")[1];
        await consumeItem(message, itemName);
      } else {
        const skillName = text.toLowerCase();
        await useSkill(message, skillName);
      }
    }
  }
};
