import { Injectable, Session } from '@nestjs/common';
import { Router } from 'express';

const router = Router();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getViewName(): string {
    return 'index';
  }
}
