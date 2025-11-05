import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly logger = new Logger(AwsS3Service.name);

  constructor() {
    this.region = process.env.AWS_REGION || '';
    this.bucket = process.env.AWS_S3_BUCKET || '';

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  /**
   * Uploads a local file to S3 and returns the public URL
   * @param localFilePath Local file path to upload
   * @param fileName Optional file name (default: basename of path)
   * @param contentType MIME type (default: image/jpeg)
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const key = `${Date.now()}-${file.originalname.replace(/\s+/g, '-').toLowerCase()}`;

      const uploadResponse = await this.s3.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: `shopify/${key}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read' as const,
      }));

      const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/shopify/${key}`;
      return fileUrl;
    } catch (error) {
      this.logger.error('❌ S3 upload failed:', error.message);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract the key from the full S3 URL
    const bucketName = this.bucket;

    // Example: https://my-bucket.s3.amazonaws.com/uploads/image.png
    const urlParts = fileUrl.split('.com/');
    const key = urlParts[1]; // shopify/2024-04-12T12:00:00Z-image.png
    console.log("🚀 ~ AwsS3Service ~ deleteFile ~ key:", {
        Bucket: bucketName,
        Key: key,
      })
    if (!key) throw new Error('Invalid S3 file URL');


    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    console.log(`🗑️ Deleted file from S3: ${key}`);
    // try {
    // } catch (error) {
    //   console.error('❌ Failed to delete file from S3:', error.message);
    //   throw error;
    // }
  }
}
