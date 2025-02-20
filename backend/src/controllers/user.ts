import { User } from "../interfaces/types"
import { Request, Response } from 'express';

export const userController=(req:Request,res:Response)=>{
    const user:User={
        name:"hasan",
        age:20
    }
    res.json(user)
}