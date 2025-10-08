import Environment from "../../../environment/environment.js";
import Item from "../../../item/item.js";

type QuestEvents = {
  inventoryAdd: [item: Item];
  inventoryRemove: [item: Item];
  arriveAt: [env: Environment];
};

export default QuestEvents;

export type QuestEvent = keyof QuestEvents;

export type QuestEventUnion<
  T extends Record<string, unknown[]>,
  Discriminant extends string = "type",
  PayloadProp extends string = "args"
> = {
  [K in keyof T]: { [P in Discriminant]: K } & { [P in PayloadProp]: T[K] };
}[keyof T];

export type AnyQuestEvent = QuestEventUnion<QuestEvents>;
