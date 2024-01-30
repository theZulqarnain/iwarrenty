import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICity } from 'src/configs/interfaces/city.interface';
import { ICountry } from 'src/configs/interfaces/country.interface';
import { IRetailer } from 'src/configs/interfaces/retailer.interface';
import { IState } from 'src/configs/interfaces/state.interface';
import { RedisClient } from 'src/configs/providers/redis.provider';
import { Country } from 'src/schemas/country.schema';
import { Retailer } from 'src/schemas/retailer.schema';
import { capitalizeWords, fromatValue, parse_spl_content_to_arr, parse_spl_content_to_obj, rename_key } from 'src/utils/functions';
import * as xlsx from 'xlsx';

@Injectable()
export class RetailerService {

    constructor(
        @InjectModel('retailers') private RetailerModel: Model<Retailer>,
        @InjectModel('countries') private CountryModel: Model<Country>,
        @InjectModel('states') private StateModel: Model<Country>,
        @InjectModel('cities') private CityModel: Model<Country>,
        @Inject('REDIS_CLIENT') private readonly Redis: RedisClient,
    ) { }

    async onModuleInit() {
        await this.ensureIndexes();
    }

    async ensureIndexes() {
        await this.RetailerModel.createIndexes();
    }
    async get_retailers(data) {
        const { page_number, page_size } = data
        try {
            const retailers = await this.RetailerModel.aggregate([
                {
                    $lookup: {
                        from: 'cities',
                        localField: 'location.city',
                        foreignField: '_id',
                        as: 'cityData'
                    }
                },
                {
                    $lookup: {
                        from: 'states',
                        localField: 'location.state',
                        foreignField: '_id',
                        as: 'stateData'
                    }
                },
                {
                    $unwind: '$cityData'
                },
                {
                    $lookup: {
                        from: 'countries',
                        localField: 'location.country',
                        foreignField: '_id',
                        as: 'countryData'
                    }
                },
                {
                    $addFields: {
                        distance: {
                            $round: ['$distance', 2],
                        },
                        'location.city': '$cityData.name',
                        'location.state': { $arrayElemAt: ['$stateData.name', 0] },
                        'location.country': { $arrayElemAt: ['$countryData.name', 0] }
                    },
                },
                {
                    $project: {
                        cityData: 0,
                        stateData: 0,
                        countryData: 0,
                        __v: 0
                    }
                },
                {
                    $skip: (page_number - 1) * page_size,
                },
                {
                    $limit: page_size,
                },
            ])
            return { success: true, data: retailers };
        } catch (e) {
            console.error('An error occurred while fetching retailers:', e);
            throw new HttpException('Internal Server Error', HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    async get_country(data) {
        const { id, code } = data
        try {
            if (id) {
                return await this.CountryModel.findById(id)
            }
            const country = await this.CountryModel.findOne({ code })
            return country
        } catch (err) {
            return err
        }
    }

    async get_state(data) {
        const { id, name } = data
        try {
            if (id) {
                return await this.StateModel.findById(id)
            }
            const country = await this.StateModel.findOne({ name })
            return country
        } catch (err) {
            return err
        }
    }

    async add_bulk_retailers(data) {
        try {
            const retailers = await this.RetailerModel.insertMany(data)
            return retailers
        } catch (err) {
            return err
        }
    }

    async get_city(data) {
        const { id, name } = data
        try {
            if (id) {
                return await this.CityModel.findById(id)
            }
            const country = await this.CityModel.findOne({ name })
            return country
        } catch (err) {
            return err
        }
    }
    async upload_file(file) {
        if (!file) {
            return { success: false, message: 'No file uploaded' };
        }

        try {
            const workbook = xlsx.read(file.buffer, { type: 'buffer' });

            // Assuming the first sheet is the one you want to convert
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert the worksheet to JSON with header option set to 1
            const json_data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

            // Extract headers from the first row
            const headers: any = json_data.shift();

            // Specify the header mapping to rename columns
            const header_mapping = {
                directory_category: 'category',
                content_children_count: "meta_data",
                directory_contact__email: "contact",
                directory_contact__fax: "contact",
                directory_contact__mobile: "contact",
                directory_contact__phone: "contact",
                directory_contact__website: "contact",
                content_post_id: "retailer_code",
                content_post_slug: "slug",
                content_body: "description",
                directory_location__street: "location",
                directory_location__city: "location",
                directory_location__state: "location",
                directory_location__country: "location",
                directory_location__address: "location",
                directory_location__lat: "geo",
                directory_location__lng: "geo",
                directory_location__zip: "location",
                directory_social__facebook: "social_media",
                directory_social__googleplus: "social_media",
                directory_social__twitter: "social_media",
                content_post_status: "status",
                content_post_title: "name"
            };

            const spl_char_content_children_count = '|';
            let retailer_country = {
                _id: null,
                name: null,
                code: null
            } as ICountry

            let retailer_state = {
                _id: null,
                name: null,
                code: null,
                country: null
            } as IState

            let retailer_city = {
                _id: null,
                name: null,
                code: null,
                country: null
            } as ICity
            const renamed_data = []
            for (let i = 0; i < json_data.length; i++) {
                const row = json_data[i];
                const renamed_row = {} as IRetailer;
                const geo_coordinates = []
                for (let index = 0; index < headers.length; index++) {
                    const header = headers[index];
                    const column_name = header_mapping[header] || header;
                    // Handle special cases based on column name
                    if (column_name === 'meta_data') {
                        const value = row[index];
                        const parsedValue = value ? parse_spl_content_to_obj(value, spl_char_content_children_count) : null;
                        renamed_row[column_name] = parsedValue;
                    } else if (column_name === 'category') {
                        const value = row[index];
                        const parsedValue = value ? parse_spl_content_to_arr(value, ";") : null;
                        renamed_row[column_name] = parsedValue;
                    } else if (column_name === 'social_media') {
                        if (!renamed_row[column_name]) {
                            renamed_row[column_name] = {};
                        }
                        const renamed_key = rename_key(header.trim());
                        renamed_row[column_name][renamed_key] = fromatValue(row[index])
                    } else if (column_name === 'location') {
                        if (!renamed_row[column_name]) {
                            renamed_row[column_name] = {};
                        }
                        const renamed_key = rename_key(header.trim())
                        if (renamed_key === "country") {
                            const formatted_country = capitalizeWords(row[index])
                            if (retailer_country.name === formatted_country) {
                                renamed_row[column_name][renamed_key] = retailer_country._id;
                            } else {
                                retailer_country = await this.get_country({ code: formatted_country })
                                renamed_row[column_name][renamed_key] = retailer_country._id;
                            }

                        } else if (renamed_key === "state") {
                            const formatted_state = capitalizeWords(row[index])
                            if (retailer_state.name === formatted_state) {
                                renamed_row[column_name][renamed_key] = retailer_state._id
                            } else {
                                retailer_state = await this.get_state({ name: formatted_state })
                                renamed_row[column_name][renamed_key] = retailer_state._id;
                            }

                        } else if (renamed_key === "city") {
                            const formatted_city = capitalizeWords(row[index])
                            if (retailer_city.name === formatted_city) {
                                renamed_row[column_name][renamed_key] = retailer_city._id
                            } else {
                                retailer_city = await this.get_city({ name: formatted_city })
                                renamed_row[column_name][renamed_key] = retailer_city._id
                            }

                        } else {
                            renamed_row[column_name][renamed_key] = row[index];
                        }
                    } else if (column_name === 'geo') {
                        const value = row[index];
                        if (header === 'directory_location__lat') {
                            geo_coordinates.push(value)
                        } else {
                            geo_coordinates.splice(0, 0, value)
                        }
                        renamed_row[column_name] = {
                            type: 'Point',
                            coordinates: geo_coordinates,
                        };
                    } else if (column_name === 'contact') {
                        if (!renamed_row[column_name]) {
                            renamed_row[column_name] = {};
                        }
                        const renamed_key = rename_key(header.trim());
                        renamed_row[column_name][renamed_key] = fromatValue(row[index])
                    } else {
                        // Default behavior for other columns
                        renamed_row[column_name] = fromatValue(row[index])
                    }
                }
                const redis_obj = await this.get_retailers_from_redis(`retailer:${renamed_row.retailer_code}`)
                let isEqual = false
                if(redis_obj?.created_at){
                    delete redis_obj?.created_at;
                    delete redis_obj?.updated_at;
                    const mapped_obj = JSON.stringify(renamed_row)
                    const stringified_redis = JSON.stringify(redis_obj)

                    isEqual = mapped_obj === stringified_redis;
                }
                if (!isEqual) {
                    renamed_row.created_at = new Date()
                    renamed_row.updated_at = new Date()
                    renamed_data.push(renamed_row)
                }
            }
            await this.add_bulk_retailers(renamed_data)
            this.add_retailers_to_redis(renamed_data)
            return { success: true, data: renamed_data };
        } catch (error) {
            console.error('Error converting XLSX file to JSON:', error);
            return { success: false, message: 'Error converting XLSX file to JSON', error: error.message };
        }

    }



    async search_retailers(data) {
        const { search_value, lng, lat, page_number, page_size, } = data
        try {
            let query: {
                $or: (
                    | { name: { $regex: any; $options: string } }
                    | { slug: { $regex: any; $options: string } }
                    | { category: { $elemMatch: { $regex: any; $options: string } } }
                    | { retailer_code: number }
                )[];
            } = {
                $or: [
                    { name: { $regex: search_value, $options: 'i' } },
                    { slug: { $regex: search_value, $options: 'i' } },
                    { category: { $elemMatch: { $regex: search_value, $options: 'i' } } }, // Case-insensitive search within the array
                ],
            };

            // Check if search_value is numeric before adding the retailer_code condition
            if (!isNaN(parseFloat(search_value)) && isFinite(search_value)) {
                query.$or.push({ retailer_code: parseInt(search_value) });
            }

            const retailers = await this.RetailerModel.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [lng, lat] },
                        distanceField: 'distance',
                        spherical: true,
                        distanceMultiplier: 0.001
                    },
                },
                {
                    $lookup: {
                        from: 'cities',
                        localField: 'location.city',
                        foreignField: '_id',
                        as: 'cityData'
                    }
                },
                {
                    $lookup: {
                        from: 'states',
                        localField: 'location.state',
                        foreignField: '_id',
                        as: 'stateData'
                    }
                },
                {
                    $unwind: '$cityData'
                },
                {
                    $lookup: {
                        from: 'countries',
                        localField: 'location.country',
                        foreignField: '_id',
                        as: 'countryData'
                    }
                },
                {
                    $match: {
                        $and: [
                            query,
                            { status: 'Published' },
                        ],
                    },
                },
                {
                    $addFields: {
                        distance: {
                            $round: ['$distance', 2],
                        },
                        'location.city': '$cityData.name',
                        'location.state': { $arrayElemAt: ['$stateData.name', 0] },
                        'location.country': { $arrayElemAt: ['$countryData.name', 0] }
                    },
                },
                {
                    $project: {
                        cityData: 0,
                        stateData: 0,
                        countryData: 0,
                        __v: 0
                    }
                },
                {
                    $skip: (page_number - 1) * page_size,
                },
                {
                    $limit: page_size,
                },
                {
                    $sort: { distance: 1 },
                },
            ])


            if (!retailers?.length) {
                return { success: true, data: [] };
            }
            return { success: true, data: retailers };
        } catch (err) {
            console.error('An error occurred while fetching retailers:', err);
            throw new HttpException('Internal Server Error', HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    async add_retailers_to_redis(data) {

        try {
            for (let i = 0; i < data.length; i++) {
                const retailer = data[i];
                await this.Redis.hset(
                    `retailer:${retailer.retailer_code}`,
                    'data',
                    JSON.stringify(retailer)
                )
            }
        } catch (e) {
            console.log(e);

        }
    }

    async get_retailers_from_redis(key) {

        try {
            const val = await this.Redis.hget(key, 'data')
            return JSON.parse(val);
        } catch (e) {
            console.log(e);

        }
    }
}



