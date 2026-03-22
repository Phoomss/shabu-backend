import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class VoidItemDto {
  @ApiProperty({ example: 'ลูกค้าเปลี่ยนใจ', description: 'เหตุผลการยกเลิก' })
  @IsString()
  @MinLength(3)
  reason: string;
}