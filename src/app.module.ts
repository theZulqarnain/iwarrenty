import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RetailerModule } from './retailer/retailer.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/iwarrenty'),
    RetailerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
