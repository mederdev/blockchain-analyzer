import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Answer {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsIn(['<', '>', '^', 'v'])
  @IsString()
  figure: string;
}

export class CreateQuizeDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsIn(['<', '>', '^', 'v'])
  @IsString()
  figure: string;

  @ApiProperty({
    isArray: true,
    type: Answer,
  })
  @IsArray()
  @ValidateNested({ each: true }) // This will validate each element in the array
  @Type(() => Answer)
  answers: Answer[];

  @ApiProperty()
  @IsNumber()
  gameId: number;
}
