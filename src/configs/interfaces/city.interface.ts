import { Types } from "mongoose";

export interface ICity {
    _id?: Types.ObjectId
    name: string
    code: string
    country: Types.ObjectId
}