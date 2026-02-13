import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Paginator, UserViewModel } from './entities/paginator.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const { login, password, email } = dto;

    // Проверяем существование пользователя
    const userByLogin = await this.prisma.user.findUnique({
      where: { login },
    });

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User with this login already exists',
            field: 'login',
          },
        ],
      });
    }

    const userByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User with this email already exists',
            field: 'email',
          },
        ],
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя (без email confirmation - через admin)
    const user = await this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        email,
        emailConfirmation: {
          confirmationCode: '',
          expirationDate: new Date(),
          isConfirmed: true, // Сразу подтвержден
        },
      },
    });

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async findAll(query: QueryUsersDto): Promise<Paginator<UserViewModel>> {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    // Используй any для orConditions
    const orConditions: any[] = [];

    if (searchLoginTerm) {
      orConditions.push({
        login: {
          contains: searchLoginTerm,
          mode: 'insensitive',
        },
      });
    }

    if (searchEmailTerm) {
      orConditions.push({
        email: {
          contains: searchEmailTerm,
          mode: 'insensitive',
        },
      });
    }

    const where: any = orConditions.length > 0 ? { OR: orConditions } : {};

    const totalCount = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users,
    };
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
