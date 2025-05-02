import ItemReference from "../../inventory/utils/itemReference.js";
import Environment from "../environment.js";

export default class StartEnvironment extends Environment {
  id: string = "start";
  name: string = "Start";
  description: string =
    "The environment you start in at the beginning of your journey.";

  items: ItemReference[] = [];
}
