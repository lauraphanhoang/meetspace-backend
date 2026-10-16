/// <reference types="jest" />

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

import { RolesGuard } from './roles.guard';
import type { AuthUser } from '../types/auth-user.type';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const getAllAndOverride = jest.fn();

  const mockUser = (role: Role): AuthUser => ({
    id: 1,
    email: 'laura@test.com',
    role,
  });

  const createContext = (user?: AuthUser): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.resetAllMocks();

    const reflector = {
      getAllAndOverride,
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  it('should allow access when no role is required', () => {
    getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('should allow an ADMIN when ADMIN is required', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(createContext(mockUser(Role.ADMIN)))).toBe(true);
  });

  it('should deny a USER when ADMIN is required', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(createContext(mockUser(Role.USER)))).toBe(false);
  });

  it('should allow a USER when USER is required', () => {
    getAllAndOverride.mockReturnValue([Role.USER]);

    expect(guard.canActivate(createContext(mockUser(Role.USER)))).toBe(true);
  });

  it('should deny an ADMIN when USER is required', () => {
    getAllAndOverride.mockReturnValue([Role.USER]);

    expect(guard.canActivate(createContext(mockUser(Role.ADMIN)))).toBe(false);
  });

  it('should allow access when the user role is in the list of required roles', () => {
    getAllAndOverride.mockReturnValue([Role.USER, Role.ADMIN]);

    expect(guard.canActivate(createContext(mockUser(Role.ADMIN)))).toBe(true);
  });

  it('should deny access when the list of required roles is empty', () => {
    getAllAndOverride.mockReturnValue([]);

    expect(guard.canActivate(createContext(mockUser(Role.ADMIN)))).toBe(false);
  });
});
