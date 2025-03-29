import {TypeExpenses} from "../models/TypeExpenses.js";

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
const  idMyUser  = req.user.uid
  const dataUpsert = Array.isArray(req.body) ? req.body : JSON.parse(req.body)

  if (!dataUpsert.every(item => typeof item === 'object' && ('_id' in item || name in item))) {
  return res.status(400).json({error: "Formato de datos invalidos"})
}
  const bulkOperations = dataUpsert.map(item => {
    const {_id, ...rest} =item
    if (_id){
      return {
        updatedOne: {
          filter: {_id, idMyUser},
          update: {$set : { ...rest, idMyUser }},
          upsert: false
        }
        },
    },
    return {
      insertOne: {
        document: {...rest, idMyUser}
      }
    }
      }), 
    const result = await TypeExpenses.bulkWrite(bulkOperations)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ message: error.message });
  }
}

export { getTypeExpenses, deleteTypeItem, upsertTypes };
