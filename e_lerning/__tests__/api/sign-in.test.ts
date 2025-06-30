/**
 * @jest-environment node
 */
jest.mock('@/utils/token', () => ({
    generateToken: jest.fn(() => 'mocked.jwt.token'),
}));

import {POST} from "@/app/api/sign-in/route";
import {createMocks} from "node-mocks-http";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

jest.mock("@/app/lib/dbConnect", () => jest.fn());
jest.mock("@/models/User");
jest.mock("bcryptjs", () => ({
    hash: jest.fn(() => Promise.resolve('hashed-password')),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('POST /api/sign-up', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
        const {req} = createMocks({
            method: 'POST',
            body: {},
        });

        req.json = async () => ({});

        const response = await POST(req as any);

        expect(response.status).toBe(400);
    });

    it('should return 404 if user not found', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue(null);

        const {req} = createMocks({
            method: 'POST'
        });

        req.json = async () => ({
            Username: 'unknownuser',
            Password: 'somepass',
            Email: 'unknown@example.com',
        });

        const response = await POST(req as any);

        expect(UserModel.findOne).toHaveBeenCalledWith({Username: 'unknownuser'});
        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body.message).toMatch(/User not found/i);
    });

    it('should return 500 if password does not match', async () => {
        const mokeUser = {
            Username: 'testuser',
            Password: 'hashedPasswordFromDB',
        };

        (UserModel.findOne as jest.Mock).mockResolvedValue(mokeUser);

        const bcryptComperMock = jest.fn().mockResolvedValue(false);
        (bcrypt as any).compare = bcryptComperMock;

        const {req} = createMocks({method: 'POST'});

        req.json = async () => ({
            Username: 'testuser',
            Password: 'wrongPassword',
            Email: 'test@example.com',
        })

        const response = await POST(req as any);

        expect(UserModel.findOne).toHaveBeenCalledWith({Username: 'testuser'});
        expect(bcryptComperMock).toHaveBeenCalledWith('wrongPassword', 'hashedPasswordFromDB');
        expect(response.status).toBe(500);

        const body = await response.json();
        expect(body.message).toMatch(/Password doesn\'t match/i);
    });

    it('should return token on successful login', async () => {
        const mockUser = {
            _id: 'user123',
            Username: 'testuser',
            Password: 'hashedPassword',
        };

        // Mock user found
        (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

        // Password matches
        (bcrypt as any).compare = jest.fn().mockResolvedValue(true);

        // Mock token generation
        const mockToken = 'mocked.jwt.token';
        jest.mock('@/utils/token', () => ({
            generateToken: jest.fn(() => mockToken),
        }));

        const {req} = createMocks({
            method: 'POST',
        });

        req.json = async () => ({
            Username: 'testuser',
            Password: 'correctPassword',
            Email: 'test@example.com',
        });

        const response = await POST(req as any);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.UserToken).toBe(mockToken);
    });

    it('should return 200 and token on successful login', async () => {
        const mockUser = {
            _id: 'user123',
            Username: 'testuser',
            Password: 'hashedPassword',
        };

        const mockToken = 'mocked.jwt.token';

        // Mock user lookup
        (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

        // Mock password comparison
        (bcrypt as any).compare = jest.fn().mockResolvedValue(true);

        // Mock generateToken to return a token
        jest.mock('@/utils/token', () => ({
            generateToken: jest.fn(() => mockToken),
        }));

        const {req} = createMocks({
            method: 'POST',
        });

        req.json = async () => ({
            Username: 'testuser',
            Password: 'correctPassword',
            Email: 'test@example.com',
        });

        const response = await POST(req as any);

        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/User Login Successfully/i);
        expect(body.UserToken).toBe(mockToken);
    });
});