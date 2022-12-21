import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { JWTPayload, IUserDoc } from "interfaces";
import { Request, Response } from "express";
import { verify } from "crypto";

//get our public key file
export const getJWTPublicKey = () => {
  const pathToKey = path.resolve(__dirname, "../../public.pem");
  const publicKey = fs.readFileSync(pathToKey, "utf8");

  if (!publicKey) {
    throw new Error("Public key not found");
  }

  return publicKey;
};

//get our private key file from the path
export const getJWTPrivateKey = () => {
  const pathToKey = path.resolve(__dirname, "../../private.pem");
  const privateKey = fs.readFileSync(pathToKey, "utf8");

  if (!privateKey) {
    throw new Error("Private key not found");
  }

  return privateKey;
};

//Used to verify the token
export const verifyJWT = (token: string) => {
  const publicKey = getJWTPublicKey();
  //Were we use our public key to verify the token
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  });

  return decoded as JWTPayload;
};

//Issue the JWT to the user
export const issueJWT = ({ user, res }: { user: IUserDoc; res: Response }) => {
  //issue the JWT
  const _id = user._id;

  const expiresIn = "14d"; //Expire in 2 weeks, to mitigate if the JWT is stolen

  const payload: JWTPayload = {
    sub: _id,
    iat: Date.now(),
    //include some info for our frontend (actually we are not using this)
    user: {
      email: user.email,
      name: user.name,
      username: user.username,
      id: user._id,
    },
  };

  //Here we sign the JWT using our private key
  const token = jwt.sign(payload, getJWTPrivateKey(), {
    expiresIn,
    algorithm: "RS256",
  });

  //set the JWT in the cookie in httpOnly mode so that it cannot be accessed by the client to avoid XSS attacks
  res.cookie("access-token", token, {
    httpOnly: false, //No http only, as we need this to be accessible by the client
    secure: false, //No https, as we are not using https in development
    //expires in 2 weeks
    maxAge: 1000 * 60 * 60 * 24 * 14,
  });
};
