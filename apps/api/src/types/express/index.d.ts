import { IUserDoc } from "interfaces";

declare global {
  namespace Express {
    export interface User extends IUserDoc {}

    export interface Request {}
  }
}
