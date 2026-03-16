import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { ItemStatus } from "@prisma/client";

export class UpdateItemStatusDto {
  @ApiProperty({ enum: ItemStatus, example: ItemStatus.PREPARING })
  @IsEnum(ItemStatus)
  status: ItemStatus;
}