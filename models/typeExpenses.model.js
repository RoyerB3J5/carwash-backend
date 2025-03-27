import mongoose from "mongoose";
const typeExpensesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    idMyUser: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    createdAt: false,
  },
);

export const TypeExpenses = mongoose.model("TypeExpenses", typeExpensesSchema);
