import { Controller, Get, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(@Res() res: Response, @Session() session: Record<string, any>): any {
    return res.render(this.appService.getViewName(), {
      title: 'MSAL Node & Express Web App',
      isAuthenticated: session.isAuthenticated,
      username: session.account?.username,
    });
  }
}
