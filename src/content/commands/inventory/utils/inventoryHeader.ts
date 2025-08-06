import {
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";

export default function inventoryHeader(name: string) {
  return (page: ContainerBuilder) => {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${name.length > 20 ? `${name.slice(0, 20)}...` : name}'s Inventory`
      )
    );

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );
    return {};
  };
}
