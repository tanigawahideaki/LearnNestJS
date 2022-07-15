import { Controller } from '@nestjs/common';
import { FetchService } from './fetch.service';

@Controller('fetch')
export class FetchController {
  constructor(private readonly fetchService: FetchService) {}
  async getFetch(endpoint: string, accessToken: any) {
    return await this.fetchService.getFetch(endpoint, accessToken);
  }
}
