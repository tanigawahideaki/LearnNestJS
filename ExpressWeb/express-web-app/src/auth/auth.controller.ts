import {
  Controller,
  Get,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { Redirect } from '@nestjsplus/redirect';
import 'isomorphic-fetch';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('signin')
  @Redirect()
  async geSingIntAuth(
    @Res() res: Response,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    await this.authService.getSignInAuth(res, next, session);
  }

  @Get('acquireToken')
  async getAcquireTokenAuth(
    @Res() res: Response,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.getAcquireTokenAuth(res, next, session);
  }

  @Post('redirect')
  @Redirect()
  async postRedirectAuth(
    @Req() req,
    @Next() next,
    @Session() session: Record<string, any>,
  ) {
    const url: string = await this.authService.postRedirectAuth(
      req,
      next,
      session,
    );

    console.log(url);

    return { statusCode: HttpStatus.FOUND, url };
  }

  @Get('signout')
  async getSignOutAuth(@Res() res, @Session() session: Record<string, any>) {
    return this.authService.getSignOutAuth(res, session);
  }
}
