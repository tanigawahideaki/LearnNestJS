import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class GetRouteTablesAllArgs {
  @Field()
  @IsNotEmpty()
  id: number;
}
