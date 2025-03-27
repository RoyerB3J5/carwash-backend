import express from "express";
import {
  getComparativeYearly,
  getComparativeMonthly,
  getComparativeWeekly,
  getDataGraphic,
  getStatistcData,
} from "../controllers/reports.controller.js";
const router = express.Router();

router.get("/comparative-year", getComparativeYearly);
router.get("/comparative-month", getComparativeMonthly);
router.get("/comparative-week", getComparativeWeekly);
router.get("/static", getStatistcData);
router.get("/:year/:month?", getDataGraphic);
export { router };
