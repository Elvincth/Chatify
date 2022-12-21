import { SchemaTimestampsConfig, Document } from "mongoose";

export interface IUser extends SchemaTimestampsConfig {
  name: string;
  email: string;
  password: string;
  username: string;
}

export interface IUserDoc extends Document, IUser {}

export interface ILoginReq {
  username: string;
  password: string;
}

export interface ILoginRes {
  token: string;
  expiresIn: IUser;
}

export interface IRegisterReq {
  name: string;
  username: string;
  password: string;
  email: string;
}

/**
 * For user search queries
 */

export interface ISearchReq {
  /**
   * If no query is provided, top 10 will be returned
   */
  q?: string;
}

export type ISearchItem = Omit<IUserDoc, "password">;

export type ISearchRes = ISearchItem[];
