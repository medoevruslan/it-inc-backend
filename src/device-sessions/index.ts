import { Router } from 'express';


export const securityRouter = Router()

securityRouter.get('/devices/')
securityRouter.delete('/devices/')
securityRouter.delete('/devices/{:deviceId}')


