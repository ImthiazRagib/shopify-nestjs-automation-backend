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

@Injectable()
export class ThemesService {
    private themePath = path.join(process.cwd(), 'src', 'shopify', 'themes',);
    private basePath = path.join(process.cwd(), 'src', 'shopify', 'themes', 'themes_temp');
    private updatedPath = path.join(process.cwd(), 'src', 'shopify', 'themes', 'updated_themes');

    constructor(
        private readonly httpService: HttpService,
        private readonly shopService: ShopService,
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
        form.append('theme[src]', fs.createReadStream(zipUrl));

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
    //         console.log("🚀 ~ ThemesService ~ updateThemeSettings ~ _sectionKey:", _sectionKey)

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
    //     console.log(`🚀 ~ ThemesService ~ updateThemeLocally ~ {
    //     themeFilePath, // can be .zip or folder
    //     jsonFilePath = 'config/settings_data.json',
    //     sectionKey,
    //     field,
    //     newValue,
    // }:`, {
    //     themeFilePath, // can be .zip or folder
    //     jsonFilePath,
    //     sectionKey,
    //     field,
    //     newValue,
    // })
    //     const themeName = path.basename(themeFilePath, path.extname(themeFilePath));
    //     console.log("🚀 ~ ThemesService ~ updateThemeLocally ~ themeName:", themeName)
    //     const tempDir = path.join(this.basePath, `${themeName}_${Date.now()}`);
    //     console.log("🚀 ~ ThemesService ~ updateThemeLocally ~ tempDir:", tempDir)
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
        console.log(`🚀 ~ ThemesService ~ updateThemeLocally called`, {
            themeFilePath,
            jsonFilePath,
            sectionKey,
            field,
            newValue,
        });

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
        extractPath,
        themeName,
    }: {
        extractPath: string;
        themeName: string;
    }): Promise<{ updatedZipPath: string; s3Url?: string } | void> {
        try {
            const updatedZipPath = path.join(this.updatedPath, `${themeName}_updated.zip`);
            ensureDir(this.updatedPath);

            // Zip updated folder
            await zipFolder(extractPath, updatedZipPath);

            // console.log(`📦 Zipped theme saved at ${updatedZipPath}`);

            // // Upload to S3
            // const s3Url = await uploadToS3(updatedZipPath, `themes/${themeName}_updated.zip`);

            // console.log(`☁️ Uploaded to S3: ${s3Url}`);

            // Optional: cleanup extracted files
            // deleteFolderRecursive(path.dirname(extractPath));

            // return { updatedZipPath, s3Url };
        } catch (err: any) {
            console.error('❌ finalizeThemeAndUpload error:', err);
            throw new InternalServerErrorException('Failed to finalize and upload theme');
        }
    }

    async getShopifyFiles(shopId: string, accessToken: string) {
        try {
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });
            const url = `${shopUrl}/files.json`
            console.log("🚀 ~ ThemesService ~ getShopifyFiles ~ url:", url)
            const response = await this.httpService.axiosRef.get(
                url,
                {
                    headers: {
                        'X-Shopify-Access-Token': accessToken,
                        'Accept': 'application/json',
                    },
                }
            );

            // The list of files
            return response.data.files;
        } catch (error) {
            console.error('Error fetching Shopify files:', error.response);
            throw error;
        }
    }

    async uploadToShopifyFiles({ shopId, accessToken, file }: { shopId: string, accessToken: string, file: Express.Multer.File }) {
        try {
            const fileContent = file.buffer.toString('base64');
            const fileName = file.originalname;
            const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });
            const _url = `${shopUrl}/files.json`
            console.log("🚀 ~ ThemesService ~ uploadToShopifyFiles ~ files:", {
                attachment: fileContent,
                filename: fileName,
                mime_type: file.mimetype,
                content_type: file.mimetype,
            },_url)

            // return {
            //     attachment: fileContent,
            //     filename: fileName,
            // }


            const response = await this.httpService.axiosRef.post(
                _url,
                {
                    file: {
                        attachment: fileContent,
                        filename: fileName,
                        mime_type: file.mimetype,
                        content_type: file.mimetype,
                    },
                },
                {
                    headers: {
                        "X-Shopify-Access-Token": accessToken,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                }
            );
            console.log("🚀 ~ ThemesService ~ uploadToShopifyFiles ~ response:", response)

            return response.data.file.public_url;
        } catch (error) {
            console.error('❌ uploadToShopifyFiles error:', error);
            throw new HttpException(
                error.message || 'Failed to upload file to Shopify',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    //     async graphql(query, variables, shopId: string, accessToken: string) {
    //         const { shopUrl } = await this.getShopifyStoreUrl({ shopId, accessToken });
    //         const res = await fetch(`${shopUrl}/graphql.json`, {
    //             method: 'POST',
    //             headers: {
    //                 'X-Shopify-Access-Token': accessToken,
    //                 'Content-Type': 'application/json; charset=utf-8',
    //                 'Accept': 'application/json',
    //             },
    //             body: JSON.stringify({ query, variables }),
    //         });
    //         const j = await res.json();
    //         if (j.errors) throw new Error(JSON.stringify(j.errors));
    //         return j.data;
    //     }

    //     async uploadFileAndMetafield(accessToken: string, shopId: string, file: Express.Multer.File) {
    //         const fileContent = file.buffer.toString('base64');
    //         const fileName = file.originalname;
    //         console.log("🚀 ~ ThemesService ~ uploadToShopifyFiles ~ files:", {
    //             attachment: fileContent,
    //             filename: fileName,
    //         },)
    //         const byteSize = fileContent.length;

    //         // 1) stagedUploadsCreate
    //         const stagedQuery = `
    //     mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    //       stagedUploadsCreate(input: $input) {
    //         stagedTargets {
    //           url
    //           resourceUrl
    //           uploadParameters {
    //             name
    //             value
    //           }
    //         }
    //         userErrors { field message }
    //       }
    //     }
    //   `;
    //         const stagedVars = {
    //             input: [{
    //                 filename: fileName,
    //                 mimeType: file.mimetype,
    //                 httpMethod: "POST",   // or "PUT" depending on the return (check stagedTargets)
    //                 resource: "FILE"
    //             }]
    //         };

    //         const stagedData = await this.graphql(stagedQuery, stagedVars, shopId, accessToken);
    //         const target = stagedData.stagedUploadsCreate.stagedTargets[0];
    //         if (!target) throw new Error('No staged target returned');

    //         // 2) Upload to the signed URL
    //         // Some targets expect a plain PUT with raw bytes, some expect POST multipart. Check uploadParameters.
    //         // If uploadParameters exists -> do multipart/form-data POST.
    //         if (target.uploadParameters && target.uploadParameters.length) {
    //             // Build a multipart/form-data body using fetch FormData
    //             const FormData = (await import('form-data')).default;
    //             const form = new FormData();
    //             target.uploadParameters.forEach(p => form.append(p.name, p.value));
    //             form.append('file', Buffer.from(fileContent), { filename: fileName, contentType: file.mimetype });
    //             await fetch(target.url, { method: 'POST', body: form });
    //         } else {
    //             // plain PUT
    //             await fetch(target.url, {
    //                 method: 'PUT',
    //                 headers: { 'Content-Type': file.mimetype, 'Content-Length': byteSize },
    //                 body: Buffer.from(fileContent)
    //             });
    //         }

    //         // 3) fileCreate using resource: resourceUrl from staged target
    //         const fileCreateQuery = `
    //     mutation fileCreate($input: [FileCreateInput!]!) {
    //       fileCreate(input: $input) {
    //         files { id url filename contentType }
    //         userErrors { field message }
    //       }
    //     }
    //   `;
    //         const fileCreateVars = {
    //             input: [{
    //                 resource: target.resourceUrl, // resourceUrl (staged upload)
    //                 filename: fileName,
    //             }]
    //         };
    //         const fileCreateRes = await this.graphql(fileCreateQuery, fileCreateVars, shopId, accessToken);
    //         const file = fileCreateRes.fileCreate.files[0];
    //         if (!file) throw new Error('fileCreate failed: ' + JSON.stringify(fileCreateRes));

    //         // 4) create metafield attached to the file (ownerId = file.id)
    //         // file.id will be a GID (gid://shopify/File/12345)
    //         const metafieldQuery = `
    //     mutation metafieldCreate($input: MetafieldInput!) {
    //       metafieldCreate(input: $input) {
    //         metafield { id namespace key value type ownerType ownerId }
    //         userErrors { field message }
    //       }
    //     }
    //   `;
    //         const metafieldVars = {
    //             input: {
    //                 namespace: "custom",
    //                 key: "content_type",
    //                 value: file.mimetype,
    //                 type: "single_line_text_field",
    //                 ownerId: file.id
    //             }
    //         };
    //         const mfRes = await this.graphql(metafieldQuery, metafieldVars, shopId, accessToken);
    //         if (mfRes.metafieldCreate.userErrors?.length) {
    //             throw new Error('metafieldCreate failed: ' + JSON.stringify(mfRes.metafieldCreate.userErrors));
    //         }

    //         return { file, metafield: mfRes.metafieldCreate.metafield };
    //     }



}
