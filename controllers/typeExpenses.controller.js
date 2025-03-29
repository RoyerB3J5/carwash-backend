import { TypeExpenses } from "../models/typeExpenses.model.js";

async function getTypeExpenses(req, res) {
  try {
    const idMyUser = req.user.uid;
    const expenses = await TypeExpenses.find({ idMyUser });
    return res.status(200).json(expenses);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: error.message });
  }
}
async function deleteTypeItem(req, res) {
  const { id } = req.params;
  const { idMyUser } = req.user.uid;
  try {
    const deleteTypeExpense = await TypeExpenses.findOneAndDelete({
      id,
      idMyUser,
    });
    if (!deleteTypeExpense) {
      return res.status(404).json({ message: "Tipo de gasto no encontrado" });
    }
    return res.status(200).json({ message: "Tipo de gasto eliminado" });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error al eliminar el tipo de gasto" });
  }
}
async function upsertTypes(req, res) {
  try {
    const idMyUser = req.user.uid;
    const newTypeExpenses = req.body;

    if (!Array.isArray(newTypeExpenses)) {
      return res
        .status(400)
        .json({ message: "Se esperaba un array de objetos" });
    }
    const typesWithUsers = newTypeExpenses.map((type) => ({
      ...type,
      idMyUser,
    }));

    const result = await TypeExpenses.insertMany(typesWithUsers);
    return res
      .status(200)
      .json({ message: "Los gastos han sido actualizados correctamente" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ message: error.message });
  }
}

export { getTypeExpenses, deleteTypeItem, upsertTypes };
