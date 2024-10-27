import levelUp from "./user/levelUp";
import giveStat from "./user/giveStat";
import createSkill from "./skill/createSkill";
import grantSkill from "./skill/grantSkill";
import deleteSkill from "./skill/deleteSkill";
import revokeSkill from "./skill/revokeSkill";
import createItem from "./item/createItem";
import giveItem from "./item/giveItem";
import revokeItem from "./item/revokeItem";
import deleteItem from "./item/deleteItem";
import statusCreate from "./status/statusCreate";
import statusDelete from "./status/statusDelete";
import statusGrant from "./status/statusGrant";
import environmentCreate from "./environment/environmentCreate";
import environmentEditName from "./environment/environmentEditName";
import environmentEditItems from "./environment/environmentEditItems";

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
    levelUp,
    giveStat,
  },
  skill: {
    create: createSkill,
    grant: grantSkill,
    delete: deleteSkill,
    revoke: revokeSkill,
  },
  item: {
    create: createItem,
    give: giveItem,
    revoke: revokeItem,
    delete: deleteItem,
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
    },
  },
};
