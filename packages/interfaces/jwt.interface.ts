import { IUserDoc } from "./user.interface";

export type JWTUser = {
  name: IUserDoc["name"];
  username: IUserDoc["username"];
  email: IUserDoc["email"];
  id: IUserDoc["_id"];
};

export interface JWTPayload {
  sub: IUserDoc["_id"];
  iat: number;
  user: JWTUser;
}
