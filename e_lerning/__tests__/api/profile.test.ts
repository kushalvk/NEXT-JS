/**
 * @jest-environment node
 */
import {GET, PUT} from '@/app/api/profile/route';
import {NextRequest} from 'next/server';
import {getVerifiedUser} from '@/utils/verifyRequest';
import UserModel from '@/models/User';

jest.mock('@/app/lib/dbConnect');
jest.mock('@/utils/verifyRequest');
jest.mock('@/models/User');

function createMockFormRequest(data: Record<string, string>): Request {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    return new Request('http://localhost/api/profile', {
        method: 'PUT',
        body: formData as any,
    });
}

describe('GET /api/profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and user data when token is valid', async () => {
        const mockUser = {_id: 'user123', Username: 'abc'};
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null,
        });

        const req = {} as NextRequest;
        const response = await GET(req);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({
            success: true,
            message: 'User Found',
            user: mockUser,
        });
    });

    it('should return errorResponse if verification fails', async () => {
        const mockErrorResponse = new Response(
            JSON.stringify({success: false, message: 'Unauthorized'}),
            {status: 401}
        );
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: mockErrorResponse,
        });

        const req = {} as NextRequest;
        const response = await GET(req);
        expect(response.status).toBe(401);
    });
});

describe('PUT /api/profile', () => {
    it('should update user and return updated user info', async () => {
        const mockUser = {_id: 'user123'};
        const mockUpdatedUser = {
            _id: 'user123',
            Username: 'newuser',
            Email: 'new@example.com',
            Full_name: 'New Name'
        };

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

        const req = createMockFormRequest({
            Username: 'newuser',
            Email: 'new@example.com',
            Full_name: 'New Name'
        });

        const response = await PUT(req);
        const body = await response.json();

        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUser._id,
            {
                Username: 'newuser',
                Email: 'new@example.com',
                Full_name: 'New Name'
            },
            {new: true}
        );

        expect(response.status).toBe(200);
        expect(body).toEqual({
            success: true,
            message: 'User Updated',
            user: mockUpdatedUser
        });
    });

    it('should return errorResponse if user is not verified', async () => {
        const mockErrorResponse = new Response(
            JSON.stringify({success: false, message: 'Unauthorized'}),
            {status: 401}
        );

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: mockErrorResponse,
        });

        const req = createMockFormRequest({
            Username: 'failuser',
            Email: 'fail@example.com',
            Full_name: 'Fail Name'
        });

        const response = await PUT(req);
        expect(response.status).toBe(401);
    });
});