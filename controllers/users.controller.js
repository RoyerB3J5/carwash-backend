import { User } from "../models/users.model.js";

const getUsersDate = async (req, res) => {
  try {
    const { start, end } = req.params;

    const users = await User.find({
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });
    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

const getUserUnfinished = async (req, res) => {
  try {
    const users = await User.find({ finished: false });
    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  try {
    const updateUser = await User.findByIdAndUpdate(id, update);
    if (!updateUser) {
      return res.status(404).send({ message: "Usuario no encontrado" });
    }
    res.send(updateUser);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
};

export { getUsersDate, getUserUnfinished, createUser, updateUser };
