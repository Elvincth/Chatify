import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { userController } from "./user.controller";
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

//routes that get user info
router.get("/me", userController.getUserInfo);

//route that fuzzy search by username or email
router.get("/search", userController.searchUsers);

export { router as userRouter };
