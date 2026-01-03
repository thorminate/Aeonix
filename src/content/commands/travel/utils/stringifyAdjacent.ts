import Environment from "../../../../models/environment/environment.js";

export default function stringifyAdjacent(environment: Environment) {
  return `${environment.name} ${environment.description}`;
}
