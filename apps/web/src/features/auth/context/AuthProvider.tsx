import { AuthContext } from "./AuthContext";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { ILoginReq, IRegisterReq, JWTPayload, JWTUser } from "interfaces";
import {
  login as _login,
  logout as _logout,
  register as _register,
} from "~/utils/request";
import { useRouter } from "next/router";
import jwtDecode from "jwt-decode";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState("");
  const [user, setUser] = useState<JWTUser>();

  const router = useRouter();

  //Login the user
  const login = async (data: ILoginReq) => {
    const res = await _login(data);

    setToken();

    return res;
  };

  //Register a user
  const register = async (data: IRegisterReq) => {
    const res = await _register(data);

    setToken();

    return res;
  };

  //Logout the user
  const logout = async () => {
    const res = await _logout();

    router.reload();

    return res;
  };

  //Set access token on init
  useEffect(() => {
    setToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setToken = () => {
    setTimeout(() => {
      setAccessToken(getCookie("access-token")?.toString() || "");
    }, 500);
  };

  useEffect(() => {
    console.log("[Access Token]: ", accessToken);

    if (accessToken) {
      const decoded = jwtDecode<JWTPayload>(accessToken);

      setUser(decoded.user);

      console.log(decoded);
    }
  }, [accessToken]);

  return (
    <>
      <AuthContext.Provider
        value={{
          accessToken,
          login,
          register,
          logout,
          user,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
