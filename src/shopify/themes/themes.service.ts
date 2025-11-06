import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import {
    downloadFile,
    ensureDir,
    readJson,
    writeJson,
    deleteFolderRecursive,
    setNestedValue,
} from './utils/file.util';
import { unzipFile, zipFolder } from './utils/zip.util';
// import { UpdateThemeDto } from './dto/update-theme.dto';
import * as fs from 'fs';
import { ShopifyThemeRole } from '../enum';
import { HttpService } from '@nestjs/axios';
import { ShopService } from '../shop/shop.service';
import { AwsS3Service } from 'src/s3-bucket/s3-bucket.service';

@Injectable()
export class ThemesService {
    private themePath = path.join(process.cwd(), 'src', 'shopify', 'themes',);
    private basePath = path.join(process.cwd(), 'src', 'shopify', 'themes', 'themes_temp');
    private updatedPath = path.join(process.cwd(), 'src', 'shopify', 'themes', 'updated_themes');

    constructor(
        private readonly httpService: HttpService,
        private readonly shopService: ShopService,
        private readonly awsS3Service: AwsS3Service,
    ) {
        ensureDir(this.basePath);
        ensureDir(this.updatedPath);
    }

    async getShopifyStoreUrl({ shopId, accessToken }: { shopId: string; accessToken: string }) {
        return this.shopService.getShopifyStoreUrl({ shopId, accessToken });
    }


    //* Themes
    async uploadTheme(payload: {
        shopId: string;
        accessToken: string;
        name: string;
        zipUrl: string;
        themeRole: ShopifyThemeRole;
    }) {

        const { shopId, accessToken, name, zipUrl, themeRole } = payload;
        const { shopUrl } = await this.getShopifyStoreUrl({
            shopId,
            accessToken,
        });

        const form = new (require('form-data'))();
        form.append('theme[role]', themeRole); // or 'main' if publishing immediately
        form.append('theme[name]', name);
        form.append('theme[src]', zipUrl);

        const url = `${shopUrl}/themes.json`;
        console.log("📦 Uploading Theme →", url);


        try {
            const { data } = await this.httpService.axiosRef.post(
                url,
                // {
                //     theme: {
                //         name,
                //         src: zipUrl, // must be public
                //         role: themeRole,
                //     },
                // },
                form,
                {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        ...form.getHeaders(),
                    },
                },
            );

            return data.theme; // returns theme ID, name, role, etc.
        } catch (error) {
            console.error('🚨 Shopify Theme Upload Error:', error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || 'Theme upload failed',
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    async publishTheme(payload: {
        shopId: string;
        accessToken: string;
        themeId: number;
    }) {
        const { shopId, accessToken, themeId } = payload;
        const { shopUrl } = await this.getShopifyStoreUrl({
            shopId,
            accessToken,
        });

        const url = `${shopUrl}/themes/${themeId}.json`;
        console.log("📦 Publishing Theme →", url);

        try {
            const { data } = await this.httpService.axiosRef.put(
                url,
                { theme: { role: 'main' } },
                {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return data.theme;
        } catch (error) {
            console.error('🚨 Shopify Theme Publish Error:', error.response?.data || error);
            throw new HttpException(
                error.response?.data?.errors || 'Theme publish failed',
                error.response?.status || HttpStatus.BAD_REQUEST,
            );
        }
    }


    async listOfThemes(shopId: string, accessToken: string) {
        const { shopUrl } = await this.getShopifyStoreUrl({
            shopId,
            accessToken,
        });
        const url = `${shopUrl}/themes.json`;
        const { data } = await this.httpService.axiosRef.get(url, {
            headers: { 'X-Shopify-Access-Token': accessToken },
        });
        return data.themes;
    }

    // async updateThemeSettings({
    //     shopId,
    //     accessToken,
    //     themeId,
    //     sectionKey,
    //     field,
    //     newValue,
    // }: {
    //     shopId: string;
    //     accessToken: string;
    //     themeId: string;
    //     sectionKey: string;
    //     field: string;
    //     newValue: any;
    // }) {
    //     const settingsFile = 'config/settings_data.json';

    //     const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });
    //     const _url = `${shopUrl}/themes/${themeId}/assets.json`

    //     try {
    //         // 1️⃣ Fetch current settings_data.json
    //         const { data } = await this.httpService.axiosRef.get(
    //             _url,
    //             {
    //                 headers: { 'X-Shopify-Access-Token': accessToken },
    //                 params: { 'asset[key]': settingsFile },
    //             },
    //         );

    //         if (!data?.asset?.value) {
    //             throw new Error(`File ${settingsFile} not found in theme ${themeId}`);
    //         }

    //         const json = JSON.parse(data.asset.value);

    //         // 2️⃣ Find section key dynamically if exact match not found
    //         const sections = json.current?.sections ?? json.sections;
    //         let _sectionKey = sections[sectionKey];

    //         if (!_sectionKey) {
    //             // Fuzzy search for section containing the name
    //             _sectionKey =
    //                 Object.entries(sections).find(([k]) =>
    //                     k.toLowerCase().includes(sectionKey.toLowerCase()),
    //                 )?.[1] ?? null;

    //             if (!_sectionKey) {
    //                 throw new Error(
    //                     `Section "${sectionKey}" not found in ${settingsFile}. Available keys: ${Object.keys(
    //                         sections,
    //                     ).join(', ')}`,
    //                 );
    //             }
    //         }

    //         // 3️⃣ Update the field
    //         _sectionKey.settings[field] = newValue;

    //         console.log('🚀 Updated section:', _sectionKey);

    //         // 4️⃣ Upload updated JSON back to Shopify
    //         const updateRes = await this.httpService.axiosRef.put(
    //             _url,
    //             {
    //                 asset: {
    //                     key: settingsFile,
    //                     value: JSON.stringify(json),
    //                 },
    //                 // value: JSON.stringify(json, null, 2),
    //             },
    //             {
    //                 headers: {
    //                     'X-Shopify-Access-Token': accessToken,
    //                     'Content-Type': 'application/json',
    //                 }
    //             },
    //         );

    //         return {
    //             success: true,
    //             message: `Updated "${field}" in section "${sectionKey}" successfully.`,
    //             response: updateRes.data,
    //         };
    //     } catch (error: any) {
    //         console.error('❌ Shopify theme update error:', error.response?.data || error.message);
    //         throw new InternalServerErrorException(
    //             error.response?.data?.errors || 'Failed to update config/settings_data.json',
    //         );
    //     }
    // }


    //* FILES SYSTEM
    /**
       * Update a local theme zip/folder and save updated zip locally
       */
    // async updateThemeLocally({
    //     themeFilePath, // can be .zip or folder
    //     jsonFilePath = 'config/settings_data.json',
    //     sectionKey,
    //     field,
    //     newValue,
    // }: {
    //     themeFilePath: string;
    //     jsonFilePath?: string;
    //     sectionKey: string;
    //     field: string;
    //     newValue: any;
    // }): Promise<{ updatedZipPath: string } | void> {
    //     const themeName = path.basename(themeFilePath, path.extname(themeFilePath));
    //     const tempDir = path.join(this.basePath, `${themeName}_${Date.now()}`);
    //     const extractPath = path.join(tempDir, 'unzipped');
    //     const updatedZipPath = path.join(this.updatedPath, `${themeName}_updated.zip`);

    //     ensureDir(tempDir);

    //     try {
    //         // 1️⃣ Unzip or copy folder
    //         if (themeFilePath.endsWith('.zip')) {
    //             await unzipFile(`${this.themePath}${themeFilePath}`, extractPath);
    //         } else if (fs.statSync(themeFilePath).isDirectory()) {
    //             fs.cpSync(themeFilePath, extractPath, { recursive: true });
    //         } else {
    //             throw new Error('Theme file must be a .zip or a directory');
    //         }

    //         // 2️⃣ Read JSON
    //         const jsonFullPath = path.join(extractPath, jsonFilePath);
    //         if (!fs.existsSync(jsonFullPath)) {
    //             throw new Error(`JSON file not found: ${jsonFilePath}`);
    //         }

    //         const jsonData = readJson(jsonFullPath);

    //         // 3️⃣ Find section dynamically
    //         const sections = jsonData.current?.sections ?? jsonData.sections;
    //         let _sectionKey = sections[sectionKey];
    //         if (!_sectionKey) {
    //             _sectionKey = Object.entries(sections).find(([k]) =>
    //                 k.toLowerCase().includes(sectionKey.toLowerCase())
    //             )?.[1];
    //         }
    //         if (!_sectionKey) {
    //             throw new Error(
    //                 `Section "${sectionKey}" not found. Available: ${Object.keys(sections).join(', ')}`
    //             );
    //         }

    //         // 4️⃣ Update the field
    //         _sectionKey.settings[field] = newValue; //! Need more debugging

    //         // 5️⃣ Save updated JSON
    //         writeJson(jsonFullPath, jsonData);

    //         // // 6️⃣ Zip folder again
    //         // await zipFolder(extractPath, updatedZipPath);

    //         // // 7️⃣ Cleanup temp folder
    //         // deleteFolderRecursive(tempDir);

    //         console.log(`✅ Theme updated and saved at: ${updatedZipPath}`);

    //         return { updatedZipPath };
    //     } catch (err: any) {
    //         console.error('❌ Theme update error:', err);
    //         throw new InternalServerErrorException('Failed to update theme JSON locally');
    //     }
    // }



    /**
    * Step 1️⃣: Extract the theme & update JSON fields (keeps the extracted folder)
    */
    async updateThemeLocally({
        themeFilePath, // can be .zip or folder
        jsonFilePath = 'config/settings_data.json',
        sectionKey,
        field,
        newValue,
    }: {
        themeFilePath: string;
        jsonFilePath?: string;
        sectionKey: string;
        field: string;
        newValue: any;
    }): Promise<{ extractPath: string; themeName: string }> {

        const themeName = path.basename(themeFilePath, path.extname(themeFilePath));
        const tempDir = path.join(this.basePath, `${themeName}_workdir`);
        const extractPath = path.join(tempDir, 'unzipped');

        ensureDir(tempDir);

        try {
            // 1️⃣ Unzip or copy folder
            if (themeFilePath.endsWith('.zip')) {
                await unzipFile(`${this.themePath}${themeFilePath}`, extractPath);
            } else if (fs.statSync(themeFilePath).isDirectory()) {
                fs.cpSync(themeFilePath, extractPath, { recursive: true });
            } else {
                throw new Error('Theme file must be a .zip or directory');
            }

            // 2️⃣ Read JSON
            const jsonFullPath = path.join(extractPath, jsonFilePath);
            if (!fs.existsSync(jsonFullPath)) {
                throw new Error(`JSON file not found: ${jsonFilePath}`);
            }

            const jsonData = readJson(jsonFullPath);

            // 3️⃣ Find section
            const sections = jsonData.current?.sections ?? jsonData.sections;
            let targetSection = sections[sectionKey];
            if (!targetSection) {
                targetSection = Object.entries(sections).find(([k]) =>
                    k.toLowerCase().includes(sectionKey.toLowerCase())
                )?.[1];
            }
            if (!targetSection) {
                throw new Error(`Section "${sectionKey}" not found`);
            }

            // 2️⃣ Update field dynamically using dot path
            setNestedValue(targetSection, field, newValue);

            // 5️⃣ Save JSON
            writeJson(jsonFullPath, jsonData);

            console.log(`✅ JSON updated successfully at ${jsonFullPath}`);
            return { extractPath, themeName };
        } catch (err: any) {
            console.error('❌ Theme update error:', err);
            throw new InternalServerErrorException('Failed to update theme JSON locally');
        }
    }

    /**
     * Step 2️⃣: Zip the updated folder and upload to S3 (or local)
     */
    async finalizeThemeAndUpload({
        shopifyStore,
        extractPath,
        themeName,
        themeRole,
    }: {
        shopifyStore: any;
        extractPath: string;
        themeName: string;
        themeRole: ShopifyThemeRole;
    }): Promise<string> {
        try {
            const updatedZipPath = path.join(this.updatedPath, `${themeName}.zip`);
            ensureDir(this.updatedPath);

            // Zip updated folder
            await zipFolder(extractPath, updatedZipPath);

            console.log(`📦 Zipped theme saved at ${updatedZipPath}`);

            // Upload to S3
            const s3Url = await this.awsS3Service.uploadFileByPath(updatedZipPath, `themes`);

            console.log(`☁️ Uploaded to S3: ${s3Url.fileUrl}`);

            // Optional: cleanup extracted files
            // deleteFolderRecursive(path.dirname(extractPath));

            await this.uploadTheme(
                {
                    shopId: shopifyStore.shopId,
                    accessToken: shopifyStore.accessToken,
                    name: themeName,
                    zipUrl: s3Url.fileUrl,
                    themeRole: themeRole,

                }
            )

            return s3Url.fileUrl;
        } catch (err: any) {
            console.error('❌ finalizeThemeAndUpload error:', err);
            throw new InternalServerErrorException('Failed to finalize and upload theme');
        }
    }

    // async getShopifyFiles(shopId: string, accessToken: string) {
    //     try {
    //         const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });
    //         const url = `${shopUrl}/files.json`
    //         const response = await this.httpService.axiosRef.get(
    //             url,
    //             {
    //                 headers: {
    //                     'X-Shopify-Access-Token': accessToken,
    //                     'Accept': 'application/json',
    //                 },
    //             }
    //         );

    //         // The list of files
    //         return response.data.files;
    //     } catch (error) {
    //         console.error('Error fetching Shopify files:', error.response);
    //         throw error;
    //     }
    // }

    async uploadToShopifyFiles({
        shopId,
        accessToken,
        file,
    }: {
        shopId: string;
        accessToken: string;
        file: Express.Multer.File;
    }) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });

            // ✅ Correct Shopify GraphQL endpoint
            const endpoint = `${shopUrl}/graphql.json`;
            const s3FileUrl = await this.awsS3Service.uploadFile(file, 'images');

            // ✅ Updated GraphQL query (correct fragments for File type)
            const query = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          alt
          createdAt
          ... on MediaImage {
            id
            image {
              url
            }
          }
          ... on GenericFile {
            id
            url
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

            const variables = {
                files: [
                    {
                        originalSource: s3FileUrl.fileUrl,
                        contentType: 'IMAGE',
                        alt: file.originalname || 'Uploaded via NestJS',
                    },
                ],
            };

            const response = await this.httpService.axiosRef.post(
                endpoint,
                { query, variables },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': accessToken,
                    },
                },
            );

            const data = response.data?.data?.fileCreate;

            if (!data) {
                console.error('Unexpected Shopify response:', response.data);
                throw new Error('Unexpected Shopify response from Shopify API');
            }

            if (data.userErrors?.length) {
                console.error('Shopify GraphQL userErrors:', data.userErrors);
                throw new Error(`Shopify error: ${JSON.stringify(data.userErrors, null, 2)}`);
            }

            const fileData = data.files[0];
            const fileUrl = fileData?.image?.url || fileData?.url;

            // Delete the file from S3 after successful upload
            await this.awsS3Service.deleteFile(s3FileUrl.fileUrl);
            return {
                id: fileData.id,
                url: `shopify://shop_images/${s3FileUrl.fileName}`,
            };
        } catch (error) {
            const errorMessage =
                error.response?.data?.errors?.[0]?.message ||
                error.message ||
                'Failed to upload file to Shopify';

            console.error('Error uploading file to Shopify:', error.response?.data || errorMessage);

            throw new HttpException(errorMessage, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadAndUpdateimages({
        shopId,
        accessToken,
        file,
        themeFilePath,
        jsonFilePath,
        sectionKey,
        field,
    }: {
        shopId: string;
        accessToken: string;
        file: Express.Multer.File;
        themeFilePath: string; // can be .zip or folder
        jsonFilePath?: string; // default to 'config/settings_data.json'
        sectionKey: string;
        field: string;
    }) {

        const fileData = await this.uploadToShopifyFiles({ shopId, accessToken, file });

        // * then update theme locally
        const updatedJson = await this.updateThemeLocally({
            themeFilePath: themeFilePath, // can be .zip or folder
            jsonFilePath: jsonFilePath || 'config/settings_data.json',
            sectionKey,
            field,
            newValue: fileData.url,
        });

        return updatedJson;
    }

}
