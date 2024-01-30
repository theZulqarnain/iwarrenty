import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Country {
  @Prop()
  name: string;

  @Prop()
  code: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
