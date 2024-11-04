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
      files: ["https://thorminate.github.io/Aeonix/images/rules.png"],
    });
    await rulesChannel.send({
      content:
        `Thank you for joining Aeonix! The rules will be categorized within the section below. In each category the consequences will be ranked by severity. Low severity (/) all the way to very-high severity (////)` +
        `\n### Severity` +
        `\n**Low severity (/)** will result in a verbal warning by one of the staff.` +
        `\n**Medium Severity (//)** results in a temporary mute by one of the staff.` +
        `\n**High Severity (///)** results in a kick by one of the staff.` +
        `\n**Very-High Severity (////)** results in a permanent ban from the server.` +
        `\n\n***Reminder:*** The severity rating can be changed if staff deem it necessary.`,
    });
    await rulesChannel.send({
      content:
        `\n\n\n# Universal` +
        `\nGeneral rules to ensure a positive and safe environment.` +
        `\n\n### Respecting Staff Decisions (/)` +
        `\nThe staff works to ensure a positive experience for everyone. Disrespecting or challenging their decisions publicly may result in a warning or mute.` +
        `\n\n### Respecting Other Members (/)` +
        `\nIf you witness a rule violation or face issues, report it to staff privately rather than publicly escalating the situation.` +
        `\n\n### No Spamming (/)` +
        `\nSpamming or excessive use of caps will result in a temporary mute by one of the staff.` +
        `\n\n### No Advertising (/)` +
        `\nUnsolicited advertising is not permitted and will result in a permanent ban. Self-promotion is only allowed in designated channels with staff approval.` +
        `\n\n### No NSFW Content (/)` +
        `\nNSFW content is not allowed and will result in a permanent ban. Self-promotion is only allowed in designated channels with staff approval.` +
        `\n\n### No Harassment (/)` +
        `\nHarassing, insulting, or belittling other members is strictly prohibited and will lead to a kick and possible further consequences based on the severity of actions.` +
        `\n\n### No Violence (/)` +
        `\nViolence is strictly prohibited and will lead to a kick and possible further consequences based on the severity of actions.` +
        `\n\n### No Trolling and Provocation (/)` +
        `\nIntentional trolling, baiting, or provoking others is not tolerated and will result in a warning or mute depending on the severity.`,
    });
    await rulesChannel.send({
      content:
        `\n\n\n# Roleplay` +
        `\nRules that apply to in-game personas.` +
        `\n\n### Metagaming (/)` +
        `\nUsing information your character couldn't know in-game for advantage is strictly prohibited. Offenders may be warned or kicked by staff.` +
        `\n\n### Powergaming (//)` +
        `\nForcing actions or consequences on other characters without consent is not allowed. Repeated offenses may lead to a kick or further consequences.` +
        `\n\n### Inappropriate Roleplay (////)` +
        `\nAny form of graphic, explicit, or otherwise inappropriate roleplay is grounds for a permanent ban. Please ensure all interactions are respectful and within server guidelines.` +
        `\n\n### Breaking Character (/)` +
        `\nConsistently speaking OOC (out of character) in roleplay channels disrupts immersion and will result in a warning. Use the designated OOC channels for any out-of-character discussions.` +
        `\n\n### Respectful Roleplay (/)` +
        `\nRoleplay channels are not allowed. Please ensure your actions are respectful and within server guidelines. If you are unsure, ask staff.`,
    });
    await rulesChannel.send({
      content:
        `\n\n\n# Chatting` +
        `\nRules that apply to people chatting OOC (out of character).` +
        `\n\n### Spamming (/)` +
        `\nSpamming or excessive use of caps will result in a temporary mute by one of the staff.` +
        `\n\n### Harassment (//)` +
        `\nHarassing, insulting, or belittling other members is strictly prohibited and will lead to a kick and possible further consequences based on the severity of actions.` +
        `\n\n### Advertising (///)` +
        `\nUnsolicited advertising is not permitted and will result in a permanent ban. Self-promotion is only allowed in designated channels with staff approval.` +
        `\n\n### Trolling and Provocation (/)` +
        `\nIntentional trolling, baiting, or provoking others is not tolerated and will result in a warning or mute depending on the severity.` +
        `\n\n### Respectful Communication (/)` +
        `\nAll communication should be respectful and within server guidelines. If you are unsure, ask staff.`,
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
