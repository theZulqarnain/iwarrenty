import { Types } from "mongoose";

export interface IRetailer {
    _id?: Types.ObjectId
    name: string
    slug: string
    description: string
    status: string
    retailer_code: number
    location: {
        street: string
        address: string
        zip: number
        country: string
        state: string
        city: string
        _id?: Types.ObjectId
    }
    contact: {
        email: string
        fax: string
        mobile: string
        phone: string
        website: string
        _id?: Types.ObjectId
    }
    category: string []
    meta_data: {
        lead: number
        review: number
        _id?: Types.ObjectId
    }
    social_media: {
        fb_link: string
        g_link: string
        x_link: string
        _id?: Types.ObjectId
    }
    created_at: Date
    updated_at: Date
    geo: {
        type: string
        coordinates: number[]
    }
    distance?: number
}