import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    if (!request.headers.authorization) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser | undefined {
    if (err) {
      return undefined;
    }
    return user ?? undefined;
  }
}
