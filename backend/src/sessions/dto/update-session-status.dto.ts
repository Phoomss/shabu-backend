import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { SessionStatus } from "@prisma/client";

export class UpdateSessionStatusDto {
  @ApiProperty({ enum: SessionStatus, example: SessionStatus.CLOSED })
  @IsEnum(SessionStatus)
  status: SessionStatus;
}