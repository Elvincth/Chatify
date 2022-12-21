import passport from "passport";
import { jwtStrategy } from "./jwtStrategy";
import { Express } from "express";

//passport.use("local", localStrategy);
passport.use("jwt", jwtStrategy);

export const configurePassport = (app: Express) => {
  // Passport middleware
  app.use(passport.initialize());
};
