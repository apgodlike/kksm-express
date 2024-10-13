import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user";
import searchRouter from "./routes/search";
import profileRouter from "./routes/profile";
import emailRouter from "./routes/email";
import { authenticateToken } from "./middlewares/authMiddleware";
import cors from "cors";

const port = process.env.PORT || 3010;

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin:
      //  true,
      [
        "http://localhost:3000",
        "http://192.168.29.126:3000",
        //   "http://192.168.140.1:3000",
        "https://kksm.ddns.net",
        //   "https://49.47.217.4",
        "https://kksm.vercel.app",
      ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
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

app.use("/api/v1/email", emailRouter);

app.get(
  "/test",
  // authenticateToken,
  async (req, res) => {
    res.json({ message: "success" });
  }
);

app.listen(port, () => {
  console.log(`listening at ${port}`);
});

export default app;
