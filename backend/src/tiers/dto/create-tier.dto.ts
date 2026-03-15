import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateTierDto {
  @ApiProperty({ example: 'Silver' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 399.00, description: 'ราคาผู้ใหญ่' })
  @IsNumber()
  @Type(() => Number)
  priceAdult: number;

  @ApiProperty({ example: 299.00, description: 'ราคาเด็ก' })
  @IsNumber()
  @Type(() => Number)
  priceChild: number;

  @ApiPropertyOptional({ example: 90, description: 'จำกัดเวลาทาน (นาที)' })
  @IsOptional()
  @IsInt()
  @Min(30)
  timeLimit?: number;
}