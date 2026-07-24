import { UserRepository } from '../repositories/user.repository';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { BadRequestException, NotFoundException, UnauthorizedException } from 'shared-common';

export class AuthService {
  private userRepository = new UserRepository();
  private tokenService = new TokenService();
  private otpService = new OtpService();
  private emailService = new EmailService();

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone: string;
    nic: string;
    dateOfBirth: string;
    address?: string;
    city?: string;
    country?: string;
  }) {
    // Check duplicate email
    const existingUser = await this.userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Check duplicate NIC
    const existingCustomer = await this.userRepository.findCustomerByNic(data.nic);
    if (existingCustomer) {
      throw new BadRequestException('NIC already registered');
    }

    // Fetch customer role ID
    const customerRole = await this.userRepository.findRoleByName('Customer');
    if (!customerRole) {
      throw new BadRequestException('Customer role not configured in the system');
    }

    const hashedPassword = await hashPassword(data.passwordHash);

    // Create user & customer record
    const user = await this.userRepository.createCustomerUser({
      email: data.email,
      passwordHash: hashedPassword,
      roleId: customerRole.id,
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      dob: new Date(data.dateOfBirth),
      phone: data.phone,
      address: data.address || 'Not Provided',
      city: data.city || 'Colombo',
      country: data.country || 'Sri Lanka',
    });

    // Generate Verification OTP
    const otp = await this.otpService.generateOtp(data.email, 'REGISTRATION');
    
    // Email verification OTP to customer
    await this.emailService.sendVerificationEmail(data.email, otp);

    return {
      userId: user.id,
      email: user.email,
    };
  }

  async login(email: string, passwordHash: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate Access & Refresh tokens
    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        role: user.role.name,
        email: user.email,
      },
    };
  }

  async logout(refreshToken: string) {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  async refreshToken(refreshToken: string) {
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      // Return success response anyway to prevent user enumeration attacks
      return;
    }

    const otp = await this.otpService.generateOtp(email, 'PASSWORD_RESET');
    await this.emailService.sendPasswordResetEmail(email, otp);
  }

  async verifyOtp(email: string, otp: string, purpose: string) {
    const isValid = await this.otpService.verifyOtp(email, otp, purpose);
    if (!isValid) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    if (purpose === 'REGISTRATION' || purpose === 'PASSWORD_RESET') {
      const user = await this.userRepository.findUserByEmail(email);
      if (user) {
        await this.userRepository.updateUserVerification(user.id, true);
      }
    }
  }

  async resetPassword(data: { email: string; otp: string; newPasswordHash: string }) {
    const isValid = await this.otpService.verifyOtp(data.email, data.otp, 'PASSWORD_RESET');
    if (!isValid) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    const hashedPassword = await hashPassword(data.newPasswordHash);
    await this.userRepository.updateUserPassword(data.email, hashedPassword);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.customer ? `${user.customer.firstName} ${user.customer.lastName}` : 'Administrator',
      email: user.email,
      role: user.role.name,
    };
  }
}
