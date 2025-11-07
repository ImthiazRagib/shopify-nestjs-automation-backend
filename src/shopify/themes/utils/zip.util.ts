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
export async function zipTheme(themeDir: string, outputZip: string) {
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);

    // ✅ Add the contents of the directory, not the directory itself
    archive.directory(themeDir + '/', false);

    archive.finalize();
  });
}
