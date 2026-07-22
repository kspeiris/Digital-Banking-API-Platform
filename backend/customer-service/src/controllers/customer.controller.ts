import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from 'shared-common';
import { customerService } from '../services/customer.service';
import { kycService } from '../services/kyc.service';
import { updateProfileSchema, submitKycSchema } from '../validators/customer.validation';

export class CustomerController {
  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await customerService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedData = updateProfileSchema.parse(req.body);
      await customerService.updateProfile(userId, validatedData);
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
      next(err);
    }
  };

  uploadProfileImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      // Store relative path in database
      const relativePath = `/uploads/profile-images/${req.file.filename}`;
      await customerService.updateProfileImage(userId, relativePath);

      res.json({ success: true, imageUrl: relativePath });
    } catch (err) {
      next(err);
    }
  };

  submitKyc = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validatedBody = submitKycSchema.parse(req.body);

      // Check files received
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};

      await kycService.submitKyc(userId, validatedBody.occupation, {
        nicFront: files['nicFront']?.[0]?.filename,
        nicBack: files['nicBack']?.[0]?.filename,
        selfie: files['selfie']?.[0]?.filename,
        addressProof: files['addressProof']?.[0]?.filename,
      });

      res.json({ success: true, message: 'KYC submitted successfully' });
    } catch (err) {
      next(err);
    }
  };

  getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Validate Admin Role (this is also checked by authorization middleware)
      const userRole = req.user?.role;
      if (userRole?.toUpperCase() !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      const { id } = req.params;
      const profile = await customerService.getCustomerById(id);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
export const customerController = new CustomerController();
