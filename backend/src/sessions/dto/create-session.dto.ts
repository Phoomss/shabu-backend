import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class CreateSessionDto {
  @ApiProperty({ example: 1, description: 'Table ID' })
  @IsInt()
  tableId: number;

  @ApiProperty({ example: 1, description: 'Tier ID' })
  @IsInt()
  tierId: number;

  @ApiProperty({ example: 2, description: 'จำนวนผู้ใหญ่' })
  @IsInt()
  adultCount: number;

  @ApiProperty({ example: 1, description: 'จำนวนเด็ก' })
  @IsInt()
  childCount: number;
}