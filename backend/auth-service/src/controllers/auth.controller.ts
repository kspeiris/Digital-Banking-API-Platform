import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from 'shared-common';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validators/auth.validation';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      await this.authService.register({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash: validatedData.password,
        phone: validatedData.phone,
        nic: validatedData.nic,
        dateOfBirth: validatedData.dateOfBirth,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Verify your email.',
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const data = await this.authService.login(validatedData.email, validatedData.password);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      res.json({ success: true, message: 'Logout successful' });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const data = await this.authService.refreshToken(refreshToken);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      await this.authService.forgotPassword(validatedData.email);
      res.json({
        success: true,
        message: 'If the email exists, an OTP has been sent.',
      });
    } catch (err) {
      next(err);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      await this.authService.verifyOtp(validatedData.email, validatedData.otp, validatedData.purpose);
      res.json({
        success: true,
        message: 'OTP verification successful.',
      });
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      await this.authService.resetPassword({
        email: validatedData.email,
        otp: validatedData.otp,
        newPasswordHash: validatedData.newPassword,
      });
      res.json({
        success: true,
        message: 'Password reset successful.',
      });
    } catch (err) {
      next(err);
    }
  };

  profile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
        return;
      }

      const data = await this.authService.getProfile(userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}
