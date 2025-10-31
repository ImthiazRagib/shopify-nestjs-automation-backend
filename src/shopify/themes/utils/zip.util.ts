import * as fs from 'fs';
import * as path from 'path';
import extract from 'extract-zip';
import archiver from 'archiver';

/**
 * ✅ Unzip a ZIP file to a given directory
 */
export const unzipFile = async (zipPath: string, extractTo: string): Promise<void> => {
  try {
    await extract(zipPath, { dir: path.resolve(extractTo) });
    console.log(`✅ Extracted ${zipPath} to ${extractTo}`);
  } catch (error) {
    console.error('❌ unzipFile error:', error);
    throw error;
  }
};

/**
 * ✅ Zip a folder (recursively) into a ZIP file
 */
export const zipFolder = async (folderPath: string, outputZipPath: string): Promise<void> => {
  try {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(folderPath, false);
    await archive.finalize();

    console.log(`✅ Created ZIP at ${outputZipPath}`);
  } catch (error) {
    console.error('❌ zipFolder error:', error);
    throw error;
  }
};
