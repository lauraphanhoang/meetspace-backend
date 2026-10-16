/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByIdWithPassword: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ==========================================
  // REGISTER
  // ==========================================

  describe('register', () => {
    const dto: CreateUserDto = {
      firstname: 'Laura',
      lastname: 'Test',
      email: 'laura@test.com',
      password: 'Password123!',
    };

    it('should register a new user with a hashed password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createdUser = {
        id: 1,
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        role: 'USER',
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed-password',
      });
      expect(result).toEqual(createdUser);
    });

    it('should reject registration when the email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // LOGIN
  // ==========================================

  describe('login', () => {
    const dto = {
      email: 'laura@test.com',
      password: 'Password123!',
    };

    const user = {
      id: 1,
      firstname: 'Laura',
      lastname: 'Test',
      email: dto.email,
      password: 'hashed-password',
      role: 'USER',
    };

    it('should log in a user with valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('fake-jwt-token');

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
        },
      });
    });

    it('should reject login when the email does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should reject login when the password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // GET PROFILE
  // ==========================================

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const user = {
        id: 1,
        firstname: 'Laura',
        lastname: 'Test',
        email: 'laura@test.com',
      };

      mockUsersService.findById.mockResolvedValue(user);

      const result = await service.getProfile(1);

      expect(result).toEqual(user);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });

    it('should reject when the user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  describe('updateProfile', () => {
    const user = {
      id: 1,
      firstname: 'Laura',
      lastname: 'Test',
      email: 'laura@test.com',
    };

    it('should update the profile', async () => {
      const dto: UpdateProfileDto = { firstname: 'Laura Updated' };
      const updatedUser = { ...user, ...dto };

      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, dto);

      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedUser);
    });

    it('should reject when the user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const dto: UpdateProfileDto = { firstname: 'Test' };

      await expect(service.updateProfile(999, dto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should reject when the new email already belongs to another user', async () => {
      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.findByEmail.mockResolvedValue({
        id: 2,
        email: 'other@test.com',
      });

      const dto: UpdateProfileDto = { email: 'other@test.com' };

      await expect(service.updateProfile(1, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should allow keeping the current email', async () => {
      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.update.mockResolvedValue(user);

      const dto: UpdateProfileDto = { email: user.email };

      const result = await service.updateProfile(1, dto);

      expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(user);
    });
  });

  // ==========================================
  // UPDATE AVATAR
  // ==========================================

  describe('updateAvatar', () => {
    it('should update the user avatar', async () => {
      const user = { id: 1, email: 'laura@test.com' };
      const updatedUser = {
        ...user,
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      mockUsersService.findById.mockResolvedValue(user);
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await service.updateAvatar(
        1,
        'https://example.com/avatar.jpg',
      );

      expect(mockUsersService.update).toHaveBeenCalledWith(1, {
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should reject when the user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.updateAvatar(999, 'https://example.com/avatar.jpg'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  describe('changePassword', () => {
    const user = {
      id: 1,
      password: 'old-hashed-password',
    };

    const dto: ChangePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should change the password when the current password is valid', async () => {
      mockUsersService.findByIdWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockUsersService.update.mockResolvedValue({ id: 1 });

      const result = await service.changePassword(1, dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.currentPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword, 10);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, {
        password: 'new-hashed-password',
      });
      expect(result).toEqual({
        message: 'Mot de passe modifié avec succès.',
      });
    });

    it('should reject when the user does not exist', async () => {
      mockUsersService.findByIdWithPassword.mockResolvedValue(null);

      await expect(service.changePassword(999, dto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should reject when the current password is incorrect', async () => {
      mockUsersService.findByIdWithPassword.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, dto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });
});
