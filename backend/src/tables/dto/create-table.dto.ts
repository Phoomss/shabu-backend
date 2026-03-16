import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { TableStatus } from "@prisma/client";

export class CreateTableDto {
  @ApiProperty({ example: 'A01', description: 'หมายเลขโต๊ะ' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ example: 'A', description: 'โซน' })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({ enum: TableStatus, default: TableStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}