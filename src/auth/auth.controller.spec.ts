/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AuthUser } from './types/auth-user.type';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    updateAvatar: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const user: AuthUser = {
    id: 1,
    email: 'laura@test.com',
    role: 'USER',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // REGISTER
  describe('register', () => {
    it('should delegate registration to AuthService', async () => {
      const dto: CreateUserDto = {
        firstname: 'Laura',
        lastname: 'Test',
        email: 'laura@test.com',
        password: 'Password123!',
      };

      const expected = { id: 1, email: dto.email };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  // LOGIN
  describe('login', () => {
    it('should delegate login to AuthService', async () => {
      const dto: LoginDto = {
        email: 'laura@test.com',
        password: 'Password123!',
      };

      const expected = {
        access_token: 'fake-jwt-token',
        user: { id: 1, email: dto.email, role: 'USER' },
      };

      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  // GET PROFILE
  describe('getProfile', () => {
    it('should retrieve the connected user profile', async () => {
      const expected = {
        id: user.id,
        firstname: 'Laura',
        lastname: 'Test',
        email: user.email,
      };

      mockAuthService.getProfile.mockResolvedValue(expected);

      const result = await controller.getProfile(user);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(expected);
    });
  });

  // UPDATE PROFILE
  describe('updateProfile', () => {
    it('should delegate profile update with the connected user ID', async () => {
      const dto: UpdateProfileDto = {
        firstname: 'Laura Updated',
      };

      const expected = {
        id: user.id,
        firstname: 'Laura Updated',
        email: user.email,
      };

      mockAuthService.updateProfile.mockResolvedValue(expected);

      const result = await controller.updateProfile(user, dto);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(user.id, dto);
      expect(result).toEqual(expected);
    });
  });

  // CHANGE PASSWORD
  describe('changePassword', () => {
    it('should delegate password change with the connected user ID', async () => {
      const dto: ChangePasswordDto = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      };

      const expected = {
        message: 'Mot de passe modifié avec succès.',
      };

      mockAuthService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword(user, dto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(user.id, dto);
      expect(result).toEqual(expected);
    });
  });

  // UPDATE AVATAR
  describe('updateAvatar', () => {
    it('should upload the avatar and update the user profile', async () => {
      const file = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image'),
      } as Express.Multer.File;

      const avatarUrl = 'https://example.com/avatar.png';
      const expected = { id: user.id, avatarUrl };

      mockCloudinaryService.uploadImage.mockResolvedValue(avatarUrl);
      mockAuthService.updateAvatar.mockResolvedValue(expected);

      const result = await controller.updateAvatar(user, file);

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        file,
        'meetspace/avatars',
      );
      expect(mockAuthService.updateAvatar).toHaveBeenCalledWith(
        user.id,
        avatarUrl,
      );
      expect(result).toEqual(expected);
    });

    it('should reject when no avatar file is provided', async () => {
      await expect(
        controller.updateAvatar(
          user,
          undefined as unknown as Express.Multer.File,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(mockAuthService.updateAvatar).not.toHaveBeenCalled();
    });
  });
});
