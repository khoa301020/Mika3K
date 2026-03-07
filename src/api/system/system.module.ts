import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';

// Error handling: catch (error) HttpError
// Validation: class-validator
// HTTP Status: HttpStatus.OK

@Module({
  controllers: [SystemController],
})
export class SystemModule {}
