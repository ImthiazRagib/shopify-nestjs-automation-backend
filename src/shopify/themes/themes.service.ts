import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import {
    downloadFile,
    ensureDir,
    readJson,
    writeJson,
    deleteFolderRecursive,
} from './utils/file.util';
import { unzipFile, zipFolder } from './utils/zip.util';
// import { UpdateThemeDto } from './dto/update-theme.dto';
import * as fs from 'fs';
import { ShopifyThemeRole } from '../enum';
import { HttpService } from '@nestjs/axios';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class ThemesService {
    constructor(
        private readonly httpService: HttpService,
        private readonly shopService: ShopService,
    ) { }


    private readonly basePath = path.join(process.cwd(), 'uploads', 'themes');

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

    async updateThemeJson(dto: any): Promise<{ zipPath: string }> {
        const { themeUrl, jsonFilePath = 'config/settings_data.json', updateData } = dto;

        try {
            const themeId = Date.now().toString();
            const tempDir = path.join(this.basePath, themeId);
            const zipPath = path.join(tempDir, 'theme.zip');
            const extractPath = path.join(tempDir, 'unzipped');
            const updatedZipPath = path.join(tempDir, 'updated_theme.zip');

            ensureDir(tempDir);

            // 1️⃣ Download theme zip
            await downloadFile(themeUrl, zipPath);

            // 2️⃣ Extract zip
            await unzipFile(zipPath, extractPath);

            // 3️⃣ Read JSON
            const jsonFullPath = path.join(extractPath, jsonFilePath);
            if (!fs.existsSync(jsonFullPath)) {
                throw new Error(`JSON file not found: ${jsonFilePath}`);
            }
            const jsonData = readJson(jsonFullPath);

            // 4️⃣ Merge new data
            const updatedJson = { ...jsonData, ...updateData };

            // 5️⃣ Write back updated JSON
            writeJson(jsonFullPath, updatedJson);

            // 6️⃣ Repackage as zip
            await zipFolder(extractPath, updatedZipPath);

            // (Optional) cleanup extract dir
            deleteFolderRecursive(extractPath);

            // 7️⃣ Return updated zip path
            return { zipPath: updatedZipPath };
        } catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Failed to update theme JSON');
        }
    }

    async updateThemeSettings({
    shopId,
    accessToken,
    themeId,
    sectionKey,
    field,
    newValue,
}: {
    shopId: string;
    accessToken: string;
    themeId: string;
    sectionKey: string;
    field: string;
    newValue: any;
}) {
    const settingsFile = 'config/settings_data.json';

    const { shopDomain } = await this.getShopifyStoreUrl({ shopId, accessToken });

    try {
        // 1️⃣ Fetch current settings_data.json
        const { data } = await this.httpService.axiosRef.get(
            `https://${shopDomain}/admin/api/2024-10/themes/${themeId}/assets.json`,
            {
                headers: { 'X-Shopify-Access-Token': accessToken },
                params: { 'asset[key]': settingsFile },
            },
        );

        if (!data?.asset?.value) {
            throw new Error(`File ${settingsFile} not found in theme ${themeId}`);
        }

        const json = JSON.parse(data.asset.value);

        // 2️⃣ Find section key dynamically if exact match not found
        const sections = json.current?.sections ?? json.sections;
        let _sectionKey = sections[sectionKey];

        if (!_sectionKey) {
            // Fuzzy search for section containing the name
            _sectionKey =
                Object.entries(sections).find(([k]) =>
                    k.toLowerCase().includes(sectionKey.toLowerCase()),
                )?.[1] ?? null;

            if (!_sectionKey) {
                throw new Error(
                    `Section "${sectionKey}" not found in ${settingsFile}. Available keys: ${Object.keys(
                        sections,
                    ).join(', ')}`,
                );
            }
        }

        // 3️⃣ Update the field
        _sectionKey.settings[field] = newValue;

        console.log('🚀 Updated section:', _sectionKey);

        // 4️⃣ Upload updated JSON back to Shopify
        const updateRes = await this.httpService.axiosRef.put(
            `https://${shopDomain}/admin/api/2024-10/themes/${themeId}/assets.json`,
            {
                asset: {
                    key: settingsFile,
                    value: JSON.stringify(json, null, 2),
                },
            },
            {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            },
        );

        return {
            success: true,
            message: `Updated "${field}" in section "${sectionKey}" successfully.`,
            response: updateRes.data,
        };
    } catch (error: any) {
        console.error('❌ Shopify theme update error:', error.response?.data || error.message);
        throw new InternalServerErrorException(
            error.response?.data?.errors || 'Failed to update config/settings_data.json',
        );
    }
}

}
