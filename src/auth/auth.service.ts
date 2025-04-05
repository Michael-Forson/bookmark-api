import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';
@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      const token = await this.signToken(user.id, user.email);
      // const { hash, ...withoutpasswordUser } = user;
      return {
        message: 'Successfully signed up',
        accesstoken: token,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new ForbiddenException('Credentials Already Taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user || !user.hash)
      throw new ForbiddenException('Credentials incorrect');
    //compare password
    const passwordMatches = await argon.verify(user.hash, dto.password);
    if (!passwordMatches)
      throw new ForbiddenException('Credentials incorrect ');

    const token = await this.signToken(user.id, user.email);
    // const { hash, ...withoutpasswordUser } = user;
    return {
      message: 'Successfully login',
      accesstoken: token,
    };
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return token;
  }
}
