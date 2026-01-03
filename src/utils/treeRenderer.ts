export type Tree = {
  name: string;
  description?: string;
  children?: Tree[];
};

export default function renderTree(node: Tree): string {
  const lines: string[] = [node.name];
  if (node.children) {
    lines.push(...renderSegment(node.children, ""));
  }
  return lines.join("\n");
}

function renderSegment(nodes: Tree[], prefix: string): string[] {
  const lines: string[] = [];
  let segment: Tree[] = [];

  const flushSegment = () => {
    if (segment.length === 0) return;
    const maxNameLen = Math.max(...segment.map((n) => n.name.length));
    const align = segment.length > 1;
    segment.forEach((node, i) => {
      const last =
        i === segment.length - 1 && nodes.indexOf(node) === nodes.length - 1;
      lines.push(renderNode(node, prefix, last, align, maxNameLen));
    });
    segment = [];
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;

    segment.push(node);

    if (node.children && node.children.length > 0) {
      flushSegment();

      const childPrefix = prefix + (i === nodes.length - 1 ? "   " : "│  ");
      lines.push(...renderSegment(node.children, childPrefix));

      segment = [];
    }
  }

  flushSegment();

  return lines;
}

function renderNode(
  node: Tree,
  prefix: string,
  isLast: boolean,
  align: boolean,
  maxNameLen: number
): string {
  const branch = isLast ? "└─ " : "├─ ";
  const name = align ? node.name.padEnd(maxNameLen, " ") : node.name;
  const label = node.description ? `${name}  ${node.description}` : name;
  return prefix + branch + label;
}
