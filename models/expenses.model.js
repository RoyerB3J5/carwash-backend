import mongoose from "mongoose";
const expensesSchema = mongoose.Schema(
  {
    idMyUser: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const Expenses = mongoose.model("Expenses", expensesSchema);
