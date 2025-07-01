/**
 * @jest-environment node
 */
import { POST } from '@/app/api/progress/watch/route';
import { Types } from 'mongoose';

jest.mock('@/app/lib/dbConnect', () => jest.fn());
jest.mock('@/utils/verifyRequest', () => ({
    getVerifiedUser: jest.fn(),
}));
jest.mock('@/models/User', () => ({
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
}));
jest.mock('@/models/Course', () => ({
    findById: jest.fn(),
}));

import { getVerifiedUser } from '@/utils/verifyRequest';
import CourseModel from '@/models/Course';

function createMockRequest(formData: Record<string, string>): Request {
    const fd = new FormData();
    for (const key in formData) {
        fd.append(key, formData[key]);
    }
    return new Request('http://localhost/api/progress/watch', {
        method: 'POST',
        body: fd as any,
    });
}

describe('POST /api/progress/watch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if user has not bought the course', async () => {
        const mockUser = {
            _id: new Types.ObjectId(),
            Buy_Course: [
                { courseId: new Types.ObjectId('60c72b2f9b1d4c3d88f0c111') }
            ],
        };

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue({
            Video: [],
        });

        const courseId = new Types.ObjectId('60c72b2f9b1d4c3d88f0c222').toString();
        const videoId = new Types.ObjectId().toString();

        const req = createMockRequest({ courseId, videoId });

        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({
            success: false,
            message: "Your are not bought this course.",
        });
    });
});