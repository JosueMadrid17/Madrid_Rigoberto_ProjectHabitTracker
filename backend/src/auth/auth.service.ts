import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.usuario.create({
      data: {
        nombre: data.nombre,
        correo: data.correo,
        password: passwordHash,
      },
    });
  }

  async login(data: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        correo: data.correo,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const passwordValido = await bcrypt.compare(
      data.password,
      usuario.password,
    );

    if (!passwordValido) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const { password, ...usuarioSinPassword } = usuario;

    const token = this.jwtService.sign({
      sub: usuario.id,
      correo: usuario.correo,
    });

    return {
      mensaje: 'Login correcto',
      access_token: token,
      usuario: usuarioSinPassword,
    };
  }
}
