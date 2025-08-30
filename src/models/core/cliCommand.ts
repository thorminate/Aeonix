/* eslint-disable @typescript-eslint/no-explicit-any */

import Aeonix from "../../aeonix.js";

export type CLIOption<
  TName extends string = string,
  TTransform extends (raw: string) => any = (raw: string) => string | undefined
> = {
  name: TName;
  description: string;
  transform?: TTransform;
};

export type CLIOptionResult<Options extends readonly CLIOption[]> = {
  [O in Options[number] as O["name"]]: O extends {
    transform: (raw: string) => infer R;
  }
    ? R
    : string;
};

export type CLICommandArgs<Options extends readonly CLIOption[]> = {
  aeonix: Aeonix;
  options: CLIOptionResult<Options>;
  primaryArg: string;
};

export default abstract class CLICommand<
  Options extends readonly CLIOption[] = CLIOption[]
> {
  abstract name: string;
  abstract description: string;
  abstract options: Options;
  abstract acceptsPrimaryArg: boolean;
  abstract execute(args: CLICommandArgs<Options>): Promise<void>;
}
/**
 * Helper type to extract the return type of a CLIOption's transform function.
 */
export type CLIOptionTransformReturn<T> = T extends CLIOption<infer R>
  ? R
  : unknown;

export function defineOptions<T extends CLIOption[]>(opts: [...T]): T {
  return opts;
}
