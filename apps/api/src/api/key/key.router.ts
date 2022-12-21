import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { keyController } from "./key.controller";
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get("/public-key/:userId", keyController.getPublicKey);

router.post("/public-key", keyController.postPublicKey);

export { router as keyRouter };
