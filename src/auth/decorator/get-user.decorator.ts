import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new Error('User not found in request');
    }
    return data ? request.user[data] : request.user;
  },
);
