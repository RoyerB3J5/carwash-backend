import Expenses from "../models/expenses.model.js";
async function deleteExpense(req, res) {
  try {
    const idMyUser = req.user.uid;
    const { id } = req.params;
    const deleteExpense = await Expenses.findOneAndDelete({
      idMyUser,
      _id: id,
    });
    if (!deleteExpense) {
      return res.status(404).json({
        error: "Expense not found",
      });
    }
    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function getExpensesByMonth(req, res) {
  try {
    const { month, year } = req.params;
    const idMyUser = req.user.uid;

    const numericMonth = parseInt(month) - 1;
    const numericYear = parseInt(year);

    if (
      isNaN(numericMonth) ||
      numericMonth < 0 ||
      numericMonth > 11 ||
      isNaN(numericYear)
    ) {
      return res.status(400).json({
        error: "Invalid month or year",
      });
    }
    const peruOffset = -5 * 60;
    const startDate = new Date(Date.UTC(numericYear, numericMonth, 1, 5, 0, 0));
    const endDate = new Date(
      Date.UTC(
        numericMonth === 11 ? numericYear + 1 : numericYear,
        numericMonth === 11 ? 0 : numericMonth + 1,
        1,
        5,
        0,
        0,
      ),
    );
    const expenses = await Expenses.find({
      idMyUser: idMyUser,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ createdAt: 1 });
    return res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
async function postNewExpense(req, res) {
  const idMyUser = req.user.uid;
  const newExpense = req.body;
  const newExpenses = {
    ...newExpense,
    idMyUser: idMyUser,
  };

  try {
    const expense = await Expenses.create(newExpenses);
    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
export { deleteExpense, getExpensesByMonth, postNewExpense };
