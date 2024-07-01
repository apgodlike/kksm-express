import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { profileSchema } from "../schemas/profileSchema";
import { getProfile, saveProfile } from "../controllers/profileController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/saveprofile",
  authenticateToken,
  validateRequest(profileSchema),
  saveProfile
);

router.get("/id/1", getProfile);

export default router;
