import express from "express";
import {
  getDataGraphic,
  getStatistcData,
  getComparativeData,
} from "../controllers/reports.controller.js";
const router = express.Router();
router.get("/comparative", getComparativeData)
router.get("/static", getStatistcData);
router.get("/data", getDataGraphic);
export { router };
