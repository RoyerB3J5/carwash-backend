import express from 'express';
import {getServices, createService,  updateService,  deleteVehicle, getServicesVehicle, getAllVehicleTypes} from '../controllers/services.controller.js'

const router = express.Router()

router.get('/',getServices)
router.get('/:vehicleType',getServicesVehicle)
router.get('/vehicle-type',getAllVehicleTypes)
router.post('/',createService)
router.put('/:vehicleType', updateService )
router.delete('/:vehicleType', deleteVehicle)

export {router} 