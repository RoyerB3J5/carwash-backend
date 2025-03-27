import express from 'express';
import { getTypeExpenses,  deleteTypeItem, upsertTypes } from '../controllers/typeExpenses.controller.js';
const router = express.Router()

router.get('/', getTypeExpenses)
router.delete('/:id', deleteTypeItem)
router.post('/', upsertTypes )

export {router}