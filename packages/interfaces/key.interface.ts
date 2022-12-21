import {
  SchemaTimestampsConfig,
  Types,
  Document,
  PopulatedDoc,
} from "mongoose";
import { IUserDoc } from "./user.interface";

export interface IKey extends SchemaTimestampsConfig {
  privateKey: string;
  publicKey: string;
  userId: PopulatedDoc<Document<Types.ObjectId> & IUserDoc>;
}

export interface IKeyDoc extends IKey, Document {}
