import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationType } from '@prisma/client';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const mockTx = {
    contact: {
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    profile: {
      findFirst: vi.fn(),
    },
  };
  const mockPrisma = {
    $transaction: vi.fn((cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
    contact: {
      findFirst: vi.fn(),
    },
  };
  return { mockTx, mockPrisma };
});

vi.mock('../utils/prisma', () => ({ default: mockPrisma }));

vi.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  S3Client: class MockS3Client { send = vi.fn(); },
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/presigned'),
}));

import {
  postSendRequestService,
  postAcceptRequestService,
  postPhoneNumberService,
} from '../services/profileService';

describe('postSendRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
  });

  it('creates contact and notification, returns contact', async () => {
    const fakeContact = {
      id: 1,
      requested_by: 10,
      requested_to: 20,
      is_accepted: false,
      is_declined: false,
      requested_by_profile: {},
      requested_to_profile: {},
    };
    mockTx.contact.create.mockResolvedValue(fakeContact);
    mockTx.notification.create.mockResolvedValue({});

    const result = await postSendRequestService(10, 20);

    expect(mockTx.contact.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requested_by: 10,
          requested_to: 20,
          is_accepted: false,
          is_declined: false,
        }),
      })
    );
    expect(mockTx.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notification_type: NotificationType.RequestReceived,
          profile_id: 20,
          sent_profile_id: 10,
        }),
      })
    );
    expect(result).toEqual(fakeContact);
  });
});

describe('postAcceptRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
  });

  it('marks contact accepted and creates RequestAccepted notification', async () => {
    const fakeContact = { id: 1, requested_by: 10, requested_to: 20, is_accepted: true };
    mockTx.contact.update.mockResolvedValue(fakeContact);
    mockTx.notification.create.mockResolvedValue({});

    const result = await postAcceptRequestService(10, 20);

    expect(mockTx.contact.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { is_accepted: true } })
    );
    expect(mockTx.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notification_type: NotificationType.RequestAccepted,
          profile_id: 10,
          sent_profile_id: 20,
        }),
      })
    );
    expect(result).toEqual(fakeContact);
  });
});

describe('postPhoneNumberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
  });

  it('returns contact info when accepted contact exists', async () => {
    mockPrisma.contact.findFirst.mockResolvedValue({ id: 1, is_accepted: true });
    mockTx.profile.findFirst.mockResolvedValue({
      contact_name: 'Alice',
      contact_number: BigInt('919900000000'),
    });
    mockTx.notification.create.mockResolvedValue({});

    const result = await postPhoneNumberService(10, 20);

    expect(mockPrisma.contact.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ is_accepted: true }) })
    );
    expect(result).toEqual({ contact_name: 'Alice', mobile_number: '919900000000' });
  });

  it('returns unAuthorized when no accepted contact exists', async () => {
    mockPrisma.contact.findFirst.mockResolvedValue(null);

    const result = await postPhoneNumberService(10, 20);

    expect(result).toEqual({ message: 'unAuthorized' });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
