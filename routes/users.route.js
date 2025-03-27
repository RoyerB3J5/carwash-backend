import express from "express";
import {
  getUsersDate,
  getUserUnfinished,
  createUser,
  updateUser,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/date", getUsersDate);
router.get("/unfinished", getUserUnfinished);
router.post("/", createUser);
router.patch("/:id", updateUser);

export { router };
