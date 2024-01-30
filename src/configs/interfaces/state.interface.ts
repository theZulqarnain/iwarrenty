import { Types } from "mongoose";

export interface IState {
    _id?: Types.ObjectId
    name: string
    code: string
    country: Types.ObjectId
}