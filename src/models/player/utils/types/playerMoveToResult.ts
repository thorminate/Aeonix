import Environment from "../../../environment/environment.js";

type PlayerMoveToResult =
  | "invalid location"
  | "not adjacent"
  | "already here"
  | "no old environment"
  | "location channel not found"
  | Environment;

export default PlayerMoveToResult;
