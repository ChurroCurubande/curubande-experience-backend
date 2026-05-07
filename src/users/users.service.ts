import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.ensureUniqueUser(createUserDto.email, createUserDto.username);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  findAll() {
    return this.userRepository.find({
      select: ['id_user', 'username', 'email'],
      order: { id_user: 'ASC' },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id_user: id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.ensureUniqueUser(
      updateUserDto.email,
      updateUserDto.username,
      user.id_user,
    );

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = Object.assign(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id_user: id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userRepository.remove(user);

    return { message: 'Usuario eliminado correctamente' };
  }

  private async ensureUniqueUser(
    email?: string,
    username?: string,
    ignoreId?: number,
  ) {
    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (existingEmail && existingEmail.id_user !== ignoreId) {
        throw new ConflictException('El correo electronico ya esta en uso');
      }
    }

    if (username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username },
      });

      if (existingUsername && existingUsername.id_user !== ignoreId) {
        throw new ConflictException('El nombre de usuario ya esta en uso');
      }
    }
  }
}
