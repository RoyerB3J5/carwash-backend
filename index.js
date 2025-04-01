import express from "express";
import mongoose from "mongoose";
import admin from "firebase-admin";
import cors from "cors";
import { router as usersRoute } from "./routes/users.route.js";
import { router as servicesRoute } from "./routes/service.route.js";
import { router as typeExpensesRoute } from "./routes/typeExpenses.route.js";
import { router as expensesRoute } from "./routes/expenses.route.js";
import { router as reportRoute } from "./routes/reports.route.js";
import fs from "fs/promises";

const serviceAccount = JSON.parse(
  await fs.readFile(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")
);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.REACT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
app.use("/users", authMiddleware, usersRoute);
app.use("/services", authMiddleware, servicesRoute);
app.use("/type-expenses", authMiddleware, typeExpensesRoute);
app.use("/expenses", authMiddleware, expensesRoute);
app.use("/report", authMiddleware, reportRoute);
//app.use("/users", usersRoute);
//app.use('/services',servicesRoute)
//app.use('/type-expenses', typeExpensesRoute)
//app.use("/expenses", expensesRoute);
//app.use("/report", reportRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("App connected to database");
    app.listen(process.env.PORT, () => {
      console.log(`App is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
