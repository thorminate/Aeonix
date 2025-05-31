import log from "../../../utils/log.js";
import Environment from "../environment.js";

const classCache = new Map<string, any>();

export default async function loadEnvironmentClass(
  id: string
): Promise<Environment | undefined> {
  const fileName = `./../../../environments/${id}.js`;

  if (classCache.has(id)) return new (classCache.get(id))();

  const module = (
    await import(fileName).catch(() => {
      log({
        header: "Error loading environment class",
        processName: "loadEnvironmentClass",
        payload: fileName || " ",
      });
      return;
    })
  ).default;

  if (!module) return;

  classCache.set(id, module);
  return new module();
}
