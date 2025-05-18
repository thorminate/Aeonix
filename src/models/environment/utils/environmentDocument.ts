import { Document } from "mongoose";
import ItemReference from "../../item/utils/itemReference.js";

export default interface EnvironmentDocument extends Document {
  _id: string;
  channelId: string;
  name: string;
  description: string;
  players: string[];
  adjacentEnvironments: string[];
  items: ItemReference[];
}
