import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

export const unzipFile = async (zipPath: string, extractTo: string): Promise<void> => {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractTo, true);
};

export const zipFolder = async (folderPath: string, outputZipPath: string): Promise<void> => {
  const zip = new AdmZip();
  const addFolder = (dir: string, baseDir: string = '') => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const relPath = path.join(baseDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFolder(fullPath, relPath);
      } else {
        zip.addFile(relPath, fs.readFileSync(fullPath));
      }
    });
  };
  addFolder(folderPath);
  zip.writeZip(outputZipPath);
};
