import Environment from "../environment.js";

const classCache = new Map<string, any>();

export default async function loadEnvironmentClass(
  id: string
): Promise<Environment> {
  const fileName = `./../../../environments/${id}.js`; // assumes "start" => "start.js"

  if (classCache.has(id)) return new (classCache.get(id))();

  const module = (await import(fileName)).default;

  classCache.set(id, module);
  return new module();
}
