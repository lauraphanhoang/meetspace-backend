/// <reference types="jest" />

import { CloudinaryService } from './cloudinary.service';

type UploadOptions = {
  folder: string;
  resource_type: 'image';
};

type UploadResult = {
  secure_url: string;
};

type UploadCallback = (error: Error | null, result?: UploadResult) => void;

type CloudinaryMock = {
  v2: {
    config: jest.Mock;
    uploader: {
      upload_stream: jest.Mock;
      destroy: jest.Mock;
    };
  };
};

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

const cloudinaryMock: CloudinaryMock = jest.requireMock('cloudinary');

const mockConfig = cloudinaryMock.v2.config;
const mockUploadStream = cloudinaryMock.v2.uploader.upload_stream;
const mockDestroy = cloudinaryMock.v2.uploader.destroy;
const mockEnd = jest.fn();

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new CloudinaryService();
  });

  describe('constructor', () => {
    it('should configure Cloudinary', () => {
      expect(mockConfig).toHaveBeenCalledWith({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    });
  });

  describe('uploadImage', () => {
    const file = {
      buffer: Buffer.from('fake image'),
    } as Express.Multer.File;

    it('should upload an image to the default folder', async () => {
      mockUploadStream.mockImplementation(
        (options: UploadOptions, callback: UploadCallback) => {
          callback(null, {
            secure_url: 'https://res.cloudinary.com/demo/image/upload/room.jpg',
          });

          return { end: mockEnd };
        },
      );

      const result = await service.uploadImage(file);

      expect(mockUploadStream).toHaveBeenCalledWith(
        {
          folder: 'meetspace/rooms',
          resource_type: 'image',
        },
        expect.any(Function),
      );
      expect(mockEnd).toHaveBeenCalledWith(file.buffer);
      expect(result).toBe(
        'https://res.cloudinary.com/demo/image/upload/room.jpg',
      );
    });

    it('should upload an image to a custom folder', async () => {
      mockUploadStream.mockImplementation(
        (options: UploadOptions, callback: UploadCallback) => {
          callback(null, {
            secure_url: 'https://res.cloudinary.com/demo/avatar.jpg',
          });

          return { end: mockEnd };
        },
      );

      const result = await service.uploadImage(file, 'meetspace/avatars');

      expect(mockUploadStream).toHaveBeenCalledWith(
        {
          folder: 'meetspace/avatars',
          resource_type: 'image',
        },
        expect.any(Function),
      );
      expect(result).toBe('https://res.cloudinary.com/demo/avatar.jpg');
    });

    it('should reject when Cloudinary returns an error', async () => {
      const error = new Error('Upload failed');

      mockUploadStream.mockImplementation(
        (options: UploadOptions, callback: UploadCallback) => {
          callback(error, undefined);
          return { end: mockEnd };
        },
      );

      await expect(service.uploadImage(file)).rejects.toThrow('Upload failed');
    });

    it('should reject when Cloudinary returns no result', async () => {
      mockUploadStream.mockImplementation(
        (options: UploadOptions, callback: UploadCallback) => {
          callback(null, undefined);
          return { end: mockEnd };
        },
      );

      await expect(service.uploadImage(file)).rejects.toThrow(
        "L'image n'a pas pu être uploadée.",
      );
    });
  });

  describe('deleteImage', () => {
    const imageUrl =
      'https://res.cloudinary.com/demo/image/upload/v123456/meetspace/rooms/salle-a.jpg';

    it('should delete an image using its public ID', async () => {
      mockDestroy.mockResolvedValue({ result: 'ok' });

      await service.deleteImage(imageUrl);

      expect(mockDestroy).toHaveBeenCalledWith('meetspace/rooms/salle-a', {
        resource_type: 'image',
      });
    });

    it('should accept an image that Cloudinary no longer finds', async () => {
      mockDestroy.mockResolvedValue({ result: 'not found' });

      await expect(service.deleteImage(imageUrl)).resolves.toBeUndefined();
    });

    it('should reject an invalid Cloudinary URL path', async () => {
      await expect(
        service.deleteImage('https://example.com/images/salle-a.jpg'),
      ).rejects.toThrow("L'URL de l'image Cloudinary est invalide.");

      expect(mockDestroy).not.toHaveBeenCalled();
    });

    it('should reject when Cloudinary deletion fails', async () => {
      mockDestroy.mockResolvedValue({ result: 'error' });

      await expect(service.deleteImage(imageUrl)).rejects.toThrow(
        "La suppression de l'image Cloudinary a échoué.",
      );
    });

    it('should reject a malformed URL', async () => {
      await expect(service.deleteImage('not-a-valid-url')).rejects.toThrow();
    });
  });
});
