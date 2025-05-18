import { Document } from "mongoose";
import Inventory from "../../inventory/inventory.js";
import Stats from "../../status/status.js";

export default interface PlayerDocument extends Document {
  _id: string;
  name: string;
  displayName: string;
  _status: Stats;
  _inventory: Inventory;
}
