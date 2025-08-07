import {
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";

export default function travelHeader() {
  return (page: ContainerBuilder) => {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# Traversal panel`)
    );

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );

    return {};
  };
}
