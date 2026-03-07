import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PushLexCookieDto {
  @ApiProperty({ description: 'The cookie string to save' })
  @IsString()
  @IsNotEmpty()
  cookieHeader: string;
}
