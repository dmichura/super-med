import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerPatient(registerPatientDto: RegisterPatientDto) {
    const email = registerPatientDto.email.trim().toLowerCase();

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Konto z tym adresem email już istnieje.');
    }

    const passwordHash = await bcrypt.hash(registerPatientDto.password, 12);

    const user = await this.prismaService.user.create({
      data: {
        email,
        passwordHash,
        role: 'PATIENT',
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      message:
        'Konto pacjenta zostało utworzone. Dostęp do dokumentacji medycznej wymaga osobistej weryfikacji w placówce.',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło.');
    }

    if (user.status === 'BLOCKED' || user.status === 'INACTIVE') {
      throw new UnauthorizedException('Konto jest nieaktywne albo zablokowane.');
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    });

    return {
      accessToken,
      user: updatedUser,
    };
  }
}