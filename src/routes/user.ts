import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema } from "../schemas/registerSchema";
import { loginUser, registerUser } from "../controllers/authController";
import { loginSchema } from "../schemas/loginSchema";

const router = Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);

export default router;
