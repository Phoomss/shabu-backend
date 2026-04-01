import { Global, Module } from '@nestjs/common';
import { IdTransformer } from './utils/id-transformer.util';

@Global()
@Module({
  providers: [IdTransformer],
  exports: [IdTransformer],
})
export class IdTransformerModule {}
