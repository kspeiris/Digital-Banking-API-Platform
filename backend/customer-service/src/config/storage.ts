import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BadRequestException } from 'shared-common';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
export const PROFILE_IMAGE_DIR = path.join(UPLOAD_ROOT, 'profile-images');
export const KYC_DIR = path.join(UPLOAD_ROOT, 'kyc');

// Ensure directories exist
[PROFILE_IMAGE_DIR, KYC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure profile image storage (random filename to prevent collision)
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILE_IMAGE_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

// Configure KYC document storage
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, KYC_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `kyc-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestException('Unsupported file type. Only JPG, PNG, and WEBP are allowed.'), false);
  }
  cb(null, true);
};

export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export const uploadKyc = multer({
  storage: kycStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
