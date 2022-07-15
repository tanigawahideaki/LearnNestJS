import { Controller, Get, Next, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { session } from 'passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersSerivce: UsersService) {}

  @Get('/id')
  async getUserAuth(
    @Res() res: Response,
    @Session() session: Record<string, any>,
  ): Promise<void> {
    this.usersSerivce.getUserAuth(res, session);
  }

  @Get('/profile')
  async getFetchUserAuth(
    @Res() res,
    @Next() next,
    @Session() session: Record<string, any>,
  ): Promise<void> {
    await this.usersSerivce.getFetchUserAuth(res, next, session);
  }
}
