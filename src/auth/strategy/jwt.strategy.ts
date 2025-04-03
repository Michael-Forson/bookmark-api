import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = config.get('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: token,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const finduser = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if(!finduser){
      throw new Error("User not found")
    }
      const {hash,...user}=finduser
    return user;
  }
}
 