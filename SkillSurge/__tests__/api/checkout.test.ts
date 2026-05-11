import { POST } from '@/app/api/checkout/route';
import UserModel from '@/models/User';
import { getVerifiedUser } from '@/utils/verifyRequest';
import mongoose from 'mongoose';

jest.mock('@/app/lib/dbConnect');
jest.mock('@/models/User');
jest.mock('@/utils/verifyRequest');

describe('POST /api/checkout', () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUser = {
        _id: mockUserId,
        name: "Test User",
        email: "test@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if courseIds is not a valid array', async () => {
        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ courseIds: null }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Invalid data');
    });

    it('should return 401 if user is not verified', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
        });

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ courseIds: ['64c6e7990c9a29f0d0e4d1b2'] }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.message).toBe('Unauthorized');
    });

    it('should successfully update user and return success response', async () => {
        const courseId = '64c6e7990c9a29f0d0e4d1b2';

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            ...mockUser,
            Buy_Course: [{ courseId: new mongoose.Types.ObjectId(courseId), buyDate: new Date() }],
        });

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ courseIds: [courseId] }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Course buy successfully');
        expect(data.User).toBeDefined();
        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should handle internal server errors gracefully', async () => {
        const courseId = '64c6e7990c9a29f0d0e4d1b2';

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('DB error'));

        const req = new Request('http://localhost/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ courseIds: [courseId] }),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.message).toMatch(/Error at checkout/);
    });
});
