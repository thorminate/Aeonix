import aeonix from "../../../index.js";
import Environment from "../environment.js";

export default async function channelIsEnvironment(
  channelId: string
): Promise<undefined | Environment> {
  const res = aeonix.environments.channelToEnv.get(channelId);
  if (res) {
    return (await aeonix.environments.get(res)) as Environment;
  }
  return;
}
