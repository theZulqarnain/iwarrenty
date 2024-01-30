import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
class Location {
  @Prop({ type: String })
  street?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: Number })
  lat?: number;

  @Prop({ type: Number })
  lng?: number;

  @Prop({ type: Number })
  zip?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country' })
  country: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'State' })
  state: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City' })
  city: MongooseSchema.Types.ObjectId;

}

@Schema()
class Contact {
  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  fax: string;

  @Prop({ type: String })
  mobile: string;

  @Prop({ type: String })
  phone: string;

  @Prop()
  website: string;
}
@Schema()
class meta_data {
  @Prop({ type: Number })
  lead: number;

  @Prop({ type: Number })
  review: number;
}

// @Schema()
// class Review {
//   @Prop({ type: String })
//   user: string;

//   @Prop({ type: Number })
//   rating: number;

//   @Prop({ type: String })
//   comment: string;

//   @Prop({ type: Date })
//   date: Date;
// }

@Schema()
class SocialMedia {
  @Prop({ type: String })
  fb_link: string;

  @Prop({ type: String })
  g_link: string;

  @Prop({ type: String })
  x_link: string;
}

@Schema()
export class Retailer {
  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  description: string;

  @Prop()
  status: string;

  @Prop({ type: Number })
  retailer_code: number;

  @Prop({ type: Location })
  location: Location;

  @Prop({ type: Contact })
  contact: Contact;

  @Prop()
  category: string [];

  @Prop()
  meta_data: meta_data;

  @Prop({ type: SocialMedia })
  social_media: SocialMedia;

  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Date })
  updated_at: Date;

  // @Prop({ type: [Review] })
  // reviews: Review[];
  @Prop({
    type: {
      type: String,
      default: 'Point', // Default to 'Point' for 2dsphere index
    },
    coordinates: [Number],
  })
  geo: {
    type: string; // Type for MongoDB 2dsphere index
    coordinates: [number, number];
  };
}

export const RetailerSchema = SchemaFactory.createForClass(Retailer);
RetailerSchema.index({geo:'2dsphere'})
