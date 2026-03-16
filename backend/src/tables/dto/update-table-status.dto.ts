import { ApiProperty } from "@nestjs/swagger";
import { TableStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateTableStatusDto {
    @ApiProperty({ enum: TableStatus, example: TableStatus.OCCUPIED })
    @IsEnum(TableStatus)
    status: TableStatus;
}