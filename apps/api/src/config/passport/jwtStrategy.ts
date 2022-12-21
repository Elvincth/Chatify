import { JWTPayload } from "interfaces";
import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import UserModel from "~/api/user/user.model";
import { getJWTPublicKey } from "~/utils/jwt";

const options: StrategyOptions = {
  jwtFromRequest: (req) => {
    //check cookies
    let token = null;

    if (req && req.cookies) {
      token = req.cookies["access-token"];
    }

    //check headers
    if (!token) {
      token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }

    return token;
  },
  secretOrKey: getJWTPublicKey(),
  algorithms: ["RS256"],
};

export const jwtStrategy = new Strategy(
  options,
  async (payload: JWTPayload, done) => {
    try {
      //See if the user exists in the database
      const user = await UserModel.findById(payload.sub);

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    } catch (e) {
      console.log(e);
      done(e, false);
    }
  }
);
