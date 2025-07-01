import fs from 'fs';
import path from 'path';

export function deleteFile(filename) {
  const filePath = path.join(process.cwd(), 'public', 'images', 'uploads', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      // console.error('File delete failed:', err);

    } else {
      // console.log('File deleted:', filename);
    }
  });
}
