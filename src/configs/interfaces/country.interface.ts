import { Types } from "mongoose";

export interface ICountry {
    _id?: Types.ObjectId,
    name: string,
    code: string
}