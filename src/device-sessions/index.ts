import { Router } from 'express';
import { getActiveSessionsByUserId } from './getActiveSessionsByUserId';


export const securityRouter = Router()

securityRouter.get('/devices/', getActiveSessionsByUserId)
securityRouter.delete('/devices/')
securityRouter.delete('/devices/{:deviceId}')


