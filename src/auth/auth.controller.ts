import { Controller, Post, Body, Get, UseGuards, Request, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyResetTokenDto } from './dto/verify-reset-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Request() req,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  refreshToken(@CurrentUser('id') userId: string) {
    return this.authService.refreshToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @CurrentUser() user: User,
    @Ip() ipAddress: string,
    @Request() req,
  ) {
    const userAgent = req.headers['user-agent'];
    return this.authService.logout(user.id, user.username, ipAddress, userAgent);
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post('verify-reset-token')
  verifyResetToken(@Body() verifyResetTokenDto: VerifyResetTokenDto) {
    return this.authService.verifyResetToken(verifyResetTokenDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}