import { Module } from '@nestjs/common';
import { AwsS3Controller } from './s3-bucket.controller';
import { AwsS3Service } from './s3-bucket.service';

@Module({
  controllers: [AwsS3Controller],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {} 
