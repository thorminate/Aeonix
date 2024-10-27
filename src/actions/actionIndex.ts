import userLevelUp from "./user/userLevelUp";
import userGiveStat from "./user/userGiveStat";
import userRelocate from "./user/userRelocate";
import skillCreate from "./skill/createSkill";
import skillGrant from "./skill/grantSkill";
import skillDelete from "./skill/deleteSkill";
import skillRevoke from "./skill/revokeSkill";
import itemCreate from "./item/createItem";
import itemGive from "./item/giveItem";
import itemRevoke from "./item/revokeItem";
import itemDelete from "./item/deleteItem";
import statusCreate from "./status/statusCreate";
import statusDelete from "./status/statusDelete";
import statusGrant from "./status/statusGrant";
import environmentCreate from "./environment/environmentCreate";
import environmentEditName from "./environment/environmentEditName";
import environmentEditItems from "./environment/environmentEditItems";
import environmentEditChannel from "./environment/environmentEditChannel";
import environmentDelete from "./environment/environmentDelete";
import botSendMessage from "./bot/botSendMessage";
import { send } from "process";

/**
 * Index of all the actions
 * @type {Object<Object<Function>>}
 *
 * example usage:
 * actions.user.levelUp(userData)
 */
export default {
  // export the index
  user: {
    // user actions
    levelUp: userLevelUp,
    giveStat: userGiveStat,
    relocate: userRelocate,
  },
  skill: {
    create: skillCreate,
    grant: skillGrant,
    delete: skillDelete,
    revoke: skillRevoke,
  },
  item: {
    create: itemCreate,
    give: itemGive,
    revoke: itemRevoke,
    delete: itemDelete,
  },
  statusEffect: {
    create: statusCreate,
    delete: statusDelete,
    grant: statusGrant,
  },
  environment: {
    create: environmentCreate,
    edit: {
      name: environmentEditName,
      items: environmentEditItems,
      channel: environmentEditChannel,
    },
    delete: environmentDelete,
  },
  bot: {
    send: botSendMessage,
  },
};
