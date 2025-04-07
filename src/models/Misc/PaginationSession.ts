import { Model, Document, Schema, model } from "mongoose";
import Saveable from "../Core/Saveable.js";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export interface ICleanPaginationSession {
  _id: string;
  guildId: string;
  channelId: string;
  pages: ActionRowBuilder<ButtonBuilder>[];
  currentPage: number;
}

export interface IPaginationSession extends Document {
  _id: string;
  guildId: string;
  channelId: string;
  pages: ActionRowBuilder<ButtonBuilder>[];
  currentPage: number;
}

export const PaginationSessionSchema = new Schema<IPaginationSession>({
  _id: { type: String, required: true },
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  pages: { type: [], required: true },
  currentPage: { type: Number, required: true },
});

export const PaginationSessionModel = model<IPaginationSession>(
  "PaginationSession",
  PaginationSessionSchema
);

export default class PaginationSession extends Saveable<IPaginationSession> {
  _id: string;
  guildId: string;
  channelId: string;
  pages: ActionRowBuilder<ButtonBuilder>[];
  currentPage: number;

  constructor(paginationSession: ICleanPaginationSession) {
    super();
    this._id = paginationSession._id;
    this.guildId = paginationSession.guildId;
    this.channelId = paginationSession.channelId;
    this.pages = paginationSession.pages;
    this.currentPage = paginationSession.currentPage;
  }

  protected getModel(): Model<IPaginationSession> {
    return PaginationSessionModel;
  }

  static getModel(): Model<IPaginationSession> {
    return PaginationSessionModel;
  }

  protected getClassMap(): Record<string, any> {
    return {};
  }

  protected getIdentifier(): { key: string[]; value: string[] } {
    return {
      key: ["_id"],
      value: [this._id],
    };
  }
}
