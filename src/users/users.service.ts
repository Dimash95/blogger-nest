import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { Paginator, UserViewModel } from './entities/paginator.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const { login, password, email } = createUserDto;

    const userByLogin = await this.userModel.findOne({ login });
    const userByEmail = await this.userModel.findOne({ email });

    if (userByLogin) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User with this login already exists', field: 'login' },
        ],
      });
    }

    if (userByEmail) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'User with this email already exists', field: 'email' },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      login,
      password: hashedPassword,
      email,
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true, // Админ создаёт - сразу подтверждён
      },
    });

    return {
      id: newUser._id.toString(),
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
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

    const orConditions: any[] = [];

    if (searchLoginTerm) {
      orConditions.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      orConditions.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    const where = orConditions.length > 0 ? { $or: orConditions } : {};

    const totalCount = await this.userModel.countDocuments(where);

    const users = await this.userModel
      .find(where)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users.map((user) => ({
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      })),
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
