import ItemReference from "../inventory/utils/itemReference.js";

export default abstract class Environment {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract items: ItemReference[];
}

export class TemplateEnvironment extends Environment {
  id: string = "";
  name: string = "";
  description: string = "";

  items: ItemReference[] = [];
}
