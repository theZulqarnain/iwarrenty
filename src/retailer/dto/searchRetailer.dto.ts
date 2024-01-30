import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class search_retailer_dto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ default: 'DYMOCKS' })
  search_value: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: -33.869959 })
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 151.207383 })
  lng: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 1 })
  page_number: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 25 })
  page_size: number;
}
