import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export default class PaginationSession {
  id: string;
  guildId: string;
  channelId: string;
  pages: ActionRowBuilder<ButtonBuilder>[];
  currentPage: number;

  constructor(
    id: string = "",
    guildId: string = "",
    channelId: string = "",
    pages: ActionRowBuilder<ButtonBuilder>[] = [],
    currentPage: number = 0
  ) {
    this.id = id;
    this.guildId = guildId;
    this.channelId = channelId;
    this.pages = pages;
    this.currentPage = currentPage;
  }
}
