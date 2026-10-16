/// <reference types="jest" />

import { JwtStrategy } from './jwt.strategy';
import type { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return the user information from the JWT payload', () => {
      const payload = {
        sub: 1,
        email: 'laura@example.com',
        role: 'ADMIN' as Role,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'laura@example.com',
        role: 'ADMIN',
      });
    });

    it('should return the USER role when the payload role is USER', () => {
      const payload = {
        sub: 2,
        email: 'user@example.com',
        role: 'USER' as Role,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 2,
        email: 'user@example.com',
        role: 'USER',
      });
    });

    it('should not expose the sub field in the returned user', () => {
      const payload = {
        sub: 3,
        email: 'test@example.com',
        role: 'USER' as Role,
      };

      const result = strategy.validate(payload);

      expect(result).not.toHaveProperty('sub');
      expect(result).toHaveProperty('id', 3);
    });
  });
});
