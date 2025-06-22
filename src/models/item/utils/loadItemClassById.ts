export default async function loadItemClass(id: string) {
  const fileName = `./../../../content/items/${id}.js`;

  const module = (await import(fileName).catch(() => undefined))?.default;

  if (!module) return;

  return new module();
}
