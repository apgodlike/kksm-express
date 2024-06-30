import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import dotenv from "dotenv";

dotenv.config();

const { JWT_SECRET } = process.env;

export const registerUser = async (req: Request, res: Response) => {
  const {
    email,
    password,
    mobile_number,
    profile_for,
    name,
    date_of_birth,
    gender,
    kulam,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          mobile_number: Number(mobile_number),
        },
      });
      const createdProfile = await tx.profile.create({
        data: {
          profile_for: profile_for,
          name: name,
          date_of_birth: date_of_birth,
          gender: gender,
          kulam: kulam,
          user: {
            connect: { id: createdUser.id },
          },
        },
      });

      return createdUser;
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    // @ts-ignore
    if (error.code === "P2002") {
      res.status(400).json({ error });
    } else {
      res.status(500).json({ error });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET!, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
};
