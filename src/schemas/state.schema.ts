import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class State {
  @Prop()
  name: string;

  @Prop()
  code: string;
  
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Country', // Reference to the Country collection
  })
  country: MongooseSchema.Types.ObjectId;
}

export const StateSchema = SchemaFactory.createForClass(State);
