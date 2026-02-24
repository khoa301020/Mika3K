import { Global, Module } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { AppHttpService } from './http.service';

@Global()
@Module({
  imports: [
    NestHttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
      headers: { 'Accept-Encoding': 'gzip' },
    }),
  ],
  providers: [AppHttpService],
  exports: [AppHttpService, NestHttpModule],
})
export class AppHttpModule {}
