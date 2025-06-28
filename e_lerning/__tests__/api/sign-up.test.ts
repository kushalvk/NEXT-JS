/**
 * @jest-environment node
 */
import {POST} from '@/app/api/sign-up/route';
import {createMocks} from 'node-mocks-http';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

jest.mock('@/app/lib/dbConnect', () => jest.fn());
jest.mock('@/models/User');
jest.mock('bcryptjs', () => ({
    hash: jest.fn(() => Promise.resolve('hashed-password')),
}));

describe('POST /api/sign-up', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
        const {req} = createMocks({
            method: 'POST',
            body: {}, // no data
        });

        // Mock req.json
        req.json = async () => ({});

        const response = await POST(req as any);

        expect(response.status).toBe(400);
    });

    it('should return 400 if user already exists by username', async () => {
        (UserModel.findOne as jest.Mock).mockImplementation(({Username}) =>
            Username ? {_id: 'existingUserId'} : null
        );

        const {req} = createMocks({
            method: 'POST',
        });

        req.json = async () => ({
            Username: 'testuser',
            Password: 'testpass',
            Email: 'test@example.com',
        });

        const response = await POST(req as any);

        expect(UserModel.findOne).toHaveBeenCalledWith({Username: 'testuser'});
        expect(response.status).toBe(400);
    });

    it('should return 500 if user already exists by email', async () => {
        (UserModel.findOne as jest.Mock)
            .mockResolvedValueOnce(null) // Username doesn't exist
            .mockResolvedValueOnce({_id: 'existingUserId'}); // Email exists

        const {req} = createMocks({method: 'POST'});

        req.json = async () => ({
            Username: 'newuser',
            Password: 'securepass',
            Email: 'exist@example.com',
        });

        const response = await POST(req as any);

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.message).toMatch(/User already exists with this Email/i);
    });

    it('should register user and return 201', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue(null);
        (UserModel.prototype.save as jest.Mock) = jest.fn().mockResolvedValue({});

        const {req} = createMocks({method: 'POST'});

        req.json = async () => ({
            Username: 'newuser',
            Password: 'securepass',
            Email: 'newuser@example.com',
            Full_name: 'New User',
        });

        const response = await POST(req as any);

        expect(bcrypt.hash).toHaveBeenCalled();
        expect(UserModel.prototype.save).toHaveBeenCalled();
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.message).toMatch(/User Registered Successfully/i);
    });
});
