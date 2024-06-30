import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user";
import searchRouter from "./routes/search";
import profileRouter from "./routes/profile";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middlewares/authMiddleware";

const port = process.env.PORT || 3010;

dotenv.config();

const app = express();
app.use(express.json());

// post login, post register, post details, get details of particular profile
// /api/v1/user
// app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRouter);
// POST Login and Register - username password - config auth

// /api/v1/profile
app.use("/api/v1/profile", profileRouter);
// POST Details - save all details for profile creation / modification

// GET Details - get particular profile full details for profile page

// post search, post advanced search, get search results, get suggessions
// /api/v1/search
app.use("/api/v1/search", searchRouter);

// POST Search - basic fields - filter and send

// POST Advanced search - all fields

// /api/v1/
// GET - suggessions

// GET - results

app.get("/test", authenticateToken, async (req, res) => {
  res.json({ message: "success" });
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
