import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetTokenDto } from './dto/verify-reset-token.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    await this.auditLogsService.create({
      userId: user.id,
      username: user.username,
      action: ActionType.LOGIN,
      entity: 'auth',
      ipAddress,
      userAgent,
    });
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string, username: string, ipAddress: string, userAgent: string) {
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.LOGOUT,
      entity: 'auth',
      ipAddress,
      userAgent,
    });
    
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security reasons, don't tell the client the email doesn't exist
      return { message: 'If your email exists in our system, you will receive a password reset link' };
    }
    
    // Generate secure token
    const token = randomBytes(32).toString('hex');
    
    // Set expiry time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Save password reset record
    await this.passwordResetRepository.save({
      email,
      token,
      expiresAt,
      used: false,
    });
    
    // Get frontend URL from config
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    // Send email with reset link
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    console.log('>>> will send reset mail to', user.email);
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset', // Create this template
      context: {
        name: user.username,
        resetLink,
        expiresAt: expiresAt.toLocaleString(),
        currentYear: new Date().getFullYear(),
      },
    });
    console.log('<<< sendMail promise resolved');
    
    // Log the action
    await this.auditLogsService.create({
      userId: user.id,
      username: user.username,
      action: ActionType.UPDATE,
      entity: 'auth',
      entityId: user.id,
      newValues: { passwordResetRequested: true },
    });
    
    return { message: 'If your email exists in our system, you will receive a password reset link' };
  }

  async verifyResetToken(verifyResetTokenDto: VerifyResetTokenDto) {
    const { token } = verifyResetTokenDto;
    
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token, used: false },
    });
    
    if (!passwordReset) {
      throw new NotFoundException('Invalid or expired token');
    }
    
    // Check if token is expired
    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Token has expired');
    }
    
    return { valid: true, email: passwordReset.email };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // Find the password reset record
    const passwordReset = await this.passwordResetRepository.findOne({
      where: { token, used: false },
    });
    
    if (!passwordReset) {
      throw new NotFoundException('Invalid or expired token');
    }
    
    // Check if token is expired
    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Token has expired');
    }
    
    // Find the user
    const user = await this.usersService.findByEmail(passwordReset.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the user's password
    await this.usersService.updatePassword(user.id, hashedPassword);
    
    // Mark the token as used
    passwordReset.used = true;
    await this.passwordResetRepository.save(passwordReset);
    
    // Log the action
    await this.auditLogsService.create({
      userId: user.id,
      username: user.username,
      action: ActionType.UPDATE,
      entity: 'auth',
      entityId: user.id,
      newValues: { passwordReset: true },
    });
    
    return { message: 'Password has been reset successfully' };
  }
}