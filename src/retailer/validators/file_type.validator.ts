import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileTypeValidator implements PipeTransform<any> {
  constructor(private readonly options: { fileType: string }) {}

  transform(value: any): any {
    const allowedTypes = [this.options.fileType];
    const fileType = value.mimetype.split('/')[1];

    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException(`Invalid file type. Expected: ${this.options.fileType}`);
    }

    return value;
  }
}