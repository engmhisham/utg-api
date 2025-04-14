import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
  
      const user = await this.usersService.findOne(payload.sub);
  
      const newAccessToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
      });
  
      return {
        accessToken: newAccessToken,
        refreshToken: this.jwtService.sign(
          { sub: user.id },
          { expiresIn: '7d' } // or however long you want
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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
}