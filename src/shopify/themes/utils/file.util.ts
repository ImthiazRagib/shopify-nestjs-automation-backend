import * as fs from 'fs';
import axios from 'axios';
import * as path from 'path';

export const downloadFile = async (url: string, outputPath: string): Promise<void> => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios.get(url, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => resolve(undefined));
    writer.on('error', reject);
  });
};

export const readJson = (filePath: string): any => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

export const writeJson = (filePath: string, data: any): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

export const deleteFolderRecursive = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
};

export function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            current[key] = value; // set the value
        } else {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {}; // create nested object if missing
            }
            current = current[key];
        }
    });
}