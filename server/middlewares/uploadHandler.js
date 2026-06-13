import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Strictly define the target directory resolving one level up to server/uploads
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');

// Ensure upload directory exists securely
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure the upload directory is not executable by default
try {
  fs.chmodSync(UPLOADS_DIR, 0o700); // Read/write/execute only by the owner
} catch (err) {
  console.warn("Could not set strict folder permissions: ", err.message);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Sanitize original filename and construct a unique UUID filename
    const originalExt = path.extname(file.originalname).toLowerCase();
    const safeName = uuidv4() + originalExt;
    cb(null, safeName);
  }
});

// File type validation (whitelist only PDF, PNG, JPG, JPEG)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit to prevent DoS
  }
});

// Secure function to retrieve file and verify it remains strictly within the uploads directory
function getSafeFilePath(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Use path.basename to strip any directory traversal segments
  const safeFilename = path.basename(filename);
  const resolvedPath = path.resolve(UPLOADS_DIR, safeFilename);
  
  // Ensure the resolved path resides strictly within the uploads directory
  // Force a trailing path separator to avoid partial prefix matching bypass
  const basePrefix = UPLOADS_DIR + (UPLOADS_DIR.endsWith(path.sep) ? '' : path.sep);
  
  if (!resolvedPath.startsWith(basePrefix)) {
    throw new Error('Security Violation: Unauthorized path traversal detected.');
  }
  
  return resolvedPath;
}

export {
  upload,
  getSafeFilePath,
  UPLOADS_DIR
};