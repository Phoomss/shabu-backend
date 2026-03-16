import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { Table } from '@prisma/client';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async findAll(): Promise<Table[]> {
    return this.prisma.table.findMany({
      orderBy: [{ zone: 'asc' }, { number: 'asc' }],
    });
  }

  async findOne(id: number): Promise<Table> {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) throw new NotFoundException(`Table #${id} not found`);
    return table;
  }

  async create(dto: CreateTableDto): Promise<Table> {
    const existing = await this.prisma.table.findUnique({
      where: { number: dto.number },
    });
    if (existing) throw new ConflictException('Table number already exists');

    return this.prisma.table.create({ data: dto });
  }

  async update(id: number, dto: UpdateTableDto): Promise<Table> {
    await this.findOne(id);

    if (dto.number) {
      const existing = await this.prisma.table.findUnique({
        where: { number: dto.number },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Table number already exists');
      }
    }

    return this.prisma.table.update({ where: { id }, data: dto });
  }

  // [Socket] อัปเดต status และแจ้ง client ทันที
  async updateStatus(id: number, dto: UpdateTableStatusDto): Promise<Table> {
    await this.findOne(id);

    const updated = await this.prisma.table.update({
      where: { id },
      data: { status: dto.status },
    });

    this.events.emitTableStatus(id, dto.status);

    return updated;
  }

  async remove(id: number): Promise<Table> {
    await this.findOne(id);
    return this.prisma.table.delete({ where: { id } });
  }
}