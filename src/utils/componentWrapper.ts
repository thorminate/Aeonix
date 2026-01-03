import {
  ActionRowBuilder,
  ButtonBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from "discord.js";

export type AnyComponentBuilder =
  | ButtonBuilder
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder;

export default function makeActionRows(
  ...components: AnyComponentBuilder[]
): ActionRowBuilder<AnyComponentBuilder>[] {
  const rows: ActionRowBuilder<AnyComponentBuilder>[] = [];

  const buttons = components.filter(
    (c): c is ButtonBuilder => c instanceof ButtonBuilder
  );
  const stringSelects = components.filter(
    (c): c is StringSelectMenuBuilder => c instanceof StringSelectMenuBuilder
  );
  const userSelects = components.filter(
    (c): c is UserSelectMenuBuilder => c instanceof UserSelectMenuBuilder
  );
  const roleSelects = components.filter(
    (c): c is RoleSelectMenuBuilder => c instanceof RoleSelectMenuBuilder
  );
  const mentionableSelects = components.filter(
    (c): c is MentionableSelectMenuBuilder =>
      c instanceof MentionableSelectMenuBuilder
  );
  const channelSelects = components.filter(
    (c): c is ChannelSelectMenuBuilder => c instanceof ChannelSelectMenuBuilder
  );

  for (let i = 0; i < buttons.length; i += 4) {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        buttons.slice(i, i + 4)
      )
    );
  }

  for (const stringSelect of stringSelects) {
    rows.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        stringSelect
      )
    );
  }

  for (const userSelect of userSelects) {
    rows.push(
      new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(userSelect)
    );
  }

  for (const roleSelect of roleSelects) {
    rows.push(
      new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(roleSelect)
    );
  }

  for (const mentionableSelect of mentionableSelects) {
    rows.push(
      new ActionRowBuilder<MentionableSelectMenuBuilder>().setComponents(
        mentionableSelect
      )
    );
  }

  for (const channelSelect of channelSelects) {
    rows.push(
      new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
        channelSelect
      )
    );
  }

  if (rows.length === 0) rows.push(new ActionRowBuilder());

  if (rows.length > 5) {
    throw new Error("Too many component rows; max is 5.");
  }

  return rows;
}
