import { Router } from "express";
import { authRouter, chatRouter, userRouter } from "~/api";
import { keyRouter } from "./api/key";

const router = Router();

//router.use("/example", exampleRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/chat", chatRouter);
router.use("/key", keyRouter);

export default router;
