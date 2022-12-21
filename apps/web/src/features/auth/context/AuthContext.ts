import { ILoginReq, ILoginRes, IRegisterReq, JWTUser } from "interfaces";
import { createContext } from "react";

export interface AuthContextProps {
  accessToken?: string;
  user?: JWTUser;
  login: (data: ILoginReq) => Promise<ILoginRes>;
  register: (data: IRegisterReq) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>(undefined!);
