import { Module } from '@nestjs/common';
import { FetchModule } from 'src/fetch/fetch.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [FetchModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
