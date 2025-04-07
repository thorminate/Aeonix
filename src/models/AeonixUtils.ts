import Item from "./Game/Item/item.js";
import Inventory from "./Game/Inventory/inventory.js";
import Player from "./Game/Player/Player.js";
import Stats from "./Game/Status/status.js";
import Saveable from "./Core/Saveable.js";
import PaginationSession from "./Misc/PaginationSession.js";

export class Modals {
  public game = {
    players: Player,
    inventory: Inventory,
    status: Stats,
    items: {
      baseItem: Item,
      getAllItems: () => Item.findAll(),
    },
  };

  public core = {
    event: Event,
    saveable: Saveable,
  };

  public misc = {
    paginationSession: PaginationSession,
  };
}
