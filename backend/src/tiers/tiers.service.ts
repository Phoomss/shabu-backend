import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTierDto } from './dto/create-tier.dto';
import { UpdateTierDto } from './dto/update-tier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tier } from '@prisma/client';

@Injectable()
export class TiersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Tier[]> {
    return this.prisma.tier.findMany();
  }

  async findOne(id: number): Promise<Tier> {
    const tier = await this.prisma.tier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException(`Tier #${id} not found`);
    return tier;
  }

  async create(dto: CreateTierDto): Promise<Tier> {
    const existing = await this.prisma.tier.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Tier name already exists');

    return this.prisma.tier.create({ data: dto });
  }

  async update(id: number, dto: UpdateTierDto): Promise<Tier> {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.tier.findUnique({ where: { name: dto.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Tier name already exists');
      }
    }

    return this.prisma.tier.update({ where: { id }, data: dto });
  }

  async remove(id: number): Promise<Tier> {
    await this.findOne(id);
    return this.prisma.tier.delete({ where: { id } });
  }
}