/* eslint-disable @typescript-eslint/no-explicit-any */

import Aeonix from "../../aeonix.js";
import merge from "../../utils/merge.js";

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

type CLICommandCallback<
  Options extends readonly CLIOption[],
  AcceptsPrimaryArg extends boolean = false
> = AcceptsPrimaryArg extends true
  ? (args: {
      aeonix: Aeonix;
      options: CLIOptionResult<Options>;
      primaryArgs: string[];
    }) => Promise<void>
  : (args: {
      aeonix: Aeonix;
      options: CLIOptionResult<Options>;
    }) => Promise<void>;

export default class CLICommand<
  Options extends readonly CLIOption[] = CLIOption[],
  AcceptsPrimaryArg extends boolean = boolean
> {
  name!: string;
  description!: string;
  options!: Options;
  acceptsPrimaryArg!: AcceptsPrimaryArg;
  execute!: CLICommandCallback<Options, AcceptsPrimaryArg>;

  constructor(o: CLICommand<Options, AcceptsPrimaryArg>) {
    return merge(this, o);
  }
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
