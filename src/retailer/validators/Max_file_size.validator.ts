import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

interface FileValidatorOptions {
  allowedFileType: string;
  maxSize: number;
}

@Injectable()
export class FileValidator implements PipeTransform<any> {
  constructor(private readonly options: FileValidatorOptions) {}

  transform(value: any): any {
    const { allowedFileType, maxSize } = this.options;

    if (value.mimetype !== allowedFileType || value.size > maxSize) {
      throw new BadRequestException(this.buildErrorMessage());
    }
    
    return value;
  }

  private buildErrorMessage(): string {
    const { allowedFileType, maxSize } = this.options;
    return `Invalid file. Expected file type: ${allowedFileType}, Maximum size: ${maxSize} bytes.`;
  }
}
