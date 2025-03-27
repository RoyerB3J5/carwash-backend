import express from 'express';
import { deleteExpense, getExpensesByMonth, postNewExpense } from '../controllers/expenses.controller.js';

const router = express.Router()

router.get('/:month/:year', getExpensesByMonth)
router.post('/', postNewExpense)
router.delete('/:id', deleteExpense)

export {router}