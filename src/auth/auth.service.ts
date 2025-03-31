import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try{


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
      return { msg: 'Successfully sign up', data: user };
    }catch(error){
      if (error instanceof PrismaClientKnownRequestError){
        if (error.code =='P2002'){
          throw new ForbiddenException("Credentials Already taken")
        }
      }
      throw error
    }
  }
  signin() {
    return { msg: 'i have sign in' };
  }
}
