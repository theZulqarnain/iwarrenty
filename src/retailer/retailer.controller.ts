import { Body, Controller, Get, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetailerService } from './retailer.service';
import { search_retailer_dto } from './dto/searchRetailer.dto';

@ApiTags('retailers')
@Controller('retailers')
export class RetailerController {
  constructor(private readonly retailerService: RetailerService) {}

  @Get('/')
  @ApiQuery({ name: 'page_number', description: 'current page', required: true, type: Number })
  @ApiQuery({ name: 'page_size', description: 'per page records', required: true, type: Number })
  async getRetailers(@Query('page_number', ParseIntPipe) pageNumber: number, @Query('page_size', ParseIntPipe) pageSize: number) {
    const params = {
      page_number: pageNumber,
      page_size: pageSize,
    };
    return this.retailerService.get_retailers(params);
  }

  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Please upload retailers xlsx file',
    schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.retailerService.upload_file(file);
  }

  @Post('/search')
  @ApiBody({ type: search_retailer_dto })
  @ApiResponse({ status: 201, description: 'search results' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async searchRetailers(@Body() body: search_retailer_dto) {
    return this.retailerService.search_retailers(body);
  }
}
