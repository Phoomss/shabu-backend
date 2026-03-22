import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }

    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });

    if (existing) {
      throw new ConflictException('Name already exists');
    }

    return this.prisma.role.create({ data: dto });
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    // เช็คว่า role มีอยู่จริงมั้ย
    await this.findOne(id);

    // เช็คว่าชื่อซ้ำกับ role อื่นมั้ย
    if (dto.name) {
      const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Name already exists');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<Role> {
    await this.findOne(id); // เช็คว่ามีอยู่จริงก่อนลบ

    return this.prisma.role.delete({ where: { id } });
  }
}