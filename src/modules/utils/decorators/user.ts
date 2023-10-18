import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const fromCallback = request?.update?.callback_query?.from;
    if (fromCallback) {
      return fromCallback;
    }
    return {
      ...request?.update?.message?.from,
    }; // Assuming the user information is stored in request.session.user
  },
);
