import { Service } from "../models/service.model.js";

const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    return res.status(200).json(services);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
const getServicesVehicle = async (req, res) => {
  try {
    const { vehicleType } = req.params;
    const services = await Service.findOne({ vehicleType });
    return res.status(200).json(services);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};
const getAllVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await Service.distinct("vehicleType");
    const formattedVehicleTypes = vehicleTypes.reduce((acc, type, index) => {
      acc[(index + 1).toString()] = type;
      return acc;
    }, {});
    return res.status(200).json(formattedVehicleTypes);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const newServices = await Service.create(req.body);
    return res.status(201).json(newServices);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

const updateService = async (req, res) => {
  const { vehicleType } = req.params;
  const { service } = req.body;

  try {
    const existingService = await Service.findOne({ vehicleType });

    if (
      !existingService ||
      JSON.stringify(existingService.service) !== JSON.stringify(service)
    ) {
      const updatedService = await Service.findOneAndUpdate(
        { vehicleType },
        { $set: { service } },
        { new: true, upsert: true },
      );
      return res.status(200).json(updatedService);
    } else {
      return res
        .status(200)
        .send({ message: "El servicio ya existe y no ha sido modificado" });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  const { vehicleType } = req.params;
  try {
    const service = await Service.findOneAndDelete({ vehicleType });
    if (!service) {
      return res.status(404).json({ message: "Vehiculo no encontrado" });
    }
    return res.status(200).json({ message: "Vehiculo eliminado" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export {
  getServices,
  createService,
  updateService,
  deleteVehicle,
  getServicesVehicle,
  getAllVehicleTypes,
};
