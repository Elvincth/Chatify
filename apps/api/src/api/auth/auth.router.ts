import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { authController } from "./auth.controller";
const router = Router();

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/logout", authController.logout);

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  authController.protected
);

export { router as authRouter };
