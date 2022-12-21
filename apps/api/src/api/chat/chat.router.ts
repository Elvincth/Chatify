import { Router } from "express";
import passport from "passport";
import { chatController } from "./chat.controller";
import { conversationGuard } from "./middleware/conversationGuard";
const router = Router();

router.use(passport.authenticate("jwt", { session: false }));

router.post("/conversations", chatController.createConversation);

router.get("/conversations", chatController.getConversationList);

router.get(
  "/messages/:conversationId",
  conversationGuard,
  chatController.getMessages
);

router.post(
  "/messages/:conversationId",
  conversationGuard,
  chatController.sendMessage
);  

export { router as chatRouter };
