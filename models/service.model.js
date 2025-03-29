import mongoose from "mongoose";

const servicesSchema = mongoose.Schema(
  {
    vehicleType: {
      type: String,
      required: true,
    },
    service: [
      {
        nameService: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    idMyUser: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

export const Service = mongoose.model("Service", servicesSchema);
