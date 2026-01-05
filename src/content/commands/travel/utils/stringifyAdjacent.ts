import Environment from "#environment/environment.js";

export default function stringifyAdjacent(environment: Environment) {
  return `${environment.name} ${environment.description}`;
}
