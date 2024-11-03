import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { config } from "dotenv";
import log from "../../utils/log";
config({
  path: "../../../.env",
});

export default async (bot: Client) => {
  const rulesChannelId = process.env.RULES_CHANNEL;
  const rulesChannel = await bot.channels.fetch(rulesChannelId);

  if (!rulesChannel || !(rulesChannel instanceof TextChannel)) {
    log({
      header: "Rules channel not found",
      type: "error",
    });
    return;
  }

  try {
    await rulesChannel.bulkDelete(10);
    await rulesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Rules")
          .setDescription(
            "Thank you for joining Aeonix! The rules will be categorized within the section below. In each category the consequences will be ranked by severity. Low severity (/) all the way to very-high severity (////)."
          )
          .setColor(0x7ab2d3)
          .addFields({
            name: "Severity",
            value:
              "**Low severity (/)** will result in a verbal warning by one of the staff.\n**Medium Severity (//)** results in a temporary mute by one of the staff.\n**High Severity (///)** results in a kick by one of the staff.\n**Very-High Severity (////)** results in a permanent ban from the server.\n\n***Reminder:*** The severity rating can be changed if staff deem it necessary.",
          }),
        new EmbedBuilder()
          .setTitle("Universal")
          .setDescription(
            "General rules to ensure a positive and safe environment."
          )
          .setColor(0x7ab2d3)
          .addFields(
            {
              name: "Respect Staff Decisions (/)",
              value:
                "The staff works to ensure a positive experience for everyone. Disrespecting or challenging their decisions publicly may result in a warning or mute.",
            },
            {
              name: "Report Issues Properly (/)",
              value:
                "If you witness a rule violation or face issues, report it to staff privately rather than publicly escalating the situation.",
            },
            {
              name: "Respect Privacy (/)",
              value:
                "Sharing personal information of others without their consent is not allowed and will lead to a temporary or permanent ban, depending on severity.",
            }
          ),
        new EmbedBuilder()
          .setTitle("Roleplay")
          .setDescription("Rules that apply to in-game personas.")
          .setColor(0x7ab2d3)
          .addFields(
            {
              name: "Metagaming (/)",
              value:
                "Using information your character couldn't know in-game for advantage is strictly prohibited. Offenders may be warned or kicked by staff.",
            },
            {
              name: "Powergaming (//)",
              value:
                "Forcing actions or consequences on other characters without consent is not allowed. Repeated offenses may lead to a kick or further consequences.",
            },
            {
              name: "Inappropriate Roleplay (////)",
              value:
                "Any form of graphic, explicit, or otherwise inappropriate roleplay is grounds for a permanent ban. Please ensure all interactions are respectful and within server guidelines.",
            },
            {
              name: "Breaking Character (/)",
              value:
                "Consistently speaking OOC (out of character) in roleplay channels disrupts immersion and will result in a warning. Use the designated OOC channels for any out-of-character discussions.",
            },
            {
              name: "Respectful Roleplay (/)",
              value:
                "Avoid themes or actions that may be sensitive or triggering for others. Be mindful of the environment, and if in doubt, ask for consent before introducing certain themes into your roleplay.",
            }
          ),
        new EmbedBuilder()
          .setTitle("Chatting")
          .setDescription(
            "Rules that apply to people chatting OOC (out of character)."
          )
          .setColor(0x7ab2d3)
          .addFields(
            {
              name: "Spamming (/)",
              value:
                "Spamming or excessive use of caps will result in a temporary mute by one of the staff.",
            },
            {
              name: "Harassment (//)",
              value:
                "Harassing, insulting, or belittling other members is strictly prohibited and will lead to a kick and possible further consequences based on the severity of actions.",
            },
            {
              name: "Advertising (///)",
              value:
                "Unsolicited advertising is not permitted and will result in a permanent ban. Self-promotion is only allowed in designated channels with staff approval.",
            },
            {
              name: "Trolling and Provocation (/)",
              value:
                "Intentional trolling, baiting, or provoking others is not tolerated and will result in a warning or mute depending on the severity.",
            },
            {
              name: "Respectful Communication (/)",
              value:
                "Engage in conversations politely and constructively. Offensive language or remarks about sensitive topics, including politics and religion, are discouraged to maintain a welcoming environment.",
            }
          ),
      ],
    });
  } catch (error) {
    console.log(error);
    log({
      header: "Rules Error",
      payload: `${error}`,
      type: "error",
    });
  }
};
