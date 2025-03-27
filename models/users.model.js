import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
    },
    wash: {
      type: String,
      required: true,
    },
    plate: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    finished: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

export const User = mongoose.model("User", userSchema);
