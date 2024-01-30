import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { redisProvider } from 'src/configs/providers/redis.provider';
import { City, CitySchema } from 'src/schemas/city.schema';
import { Country, CountrySchema } from 'src/schemas/country.schema';
import { RetailerSchema } from 'src/schemas/retailer.schema';
import { StateSchema } from 'src/schemas/state.schema';
import { RetailerController } from './retailer.controller';
import { RetailerService } from './retailer.service';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: 'retailers', schema: RetailerSchema },
      { name: 'countries', schema: CountrySchema },
      { name: 'states', schema: StateSchema },
      { name: 'cities', schema: CitySchema }
    ]),
  ],
  controllers: [RetailerController],
  providers: [RetailerService,redisProvider]
})
export class RetailerModule {}
