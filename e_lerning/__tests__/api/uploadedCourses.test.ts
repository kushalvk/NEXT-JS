import { GET } from '@/app/api/uploadcourse/route';
import { getVerifiedUser } from '@/utils/verifyRequest';
import UserModel from '@/models/User';
import CourseModel from '@/models/Course';

jest.mock('@/app/lib/dbConnect');
jest.mock('@/utils/verifyRequest');
jest.mock('@/models/User');
jest.mock('@/models/Course');

describe('GET /api/course/uploaded', () => {
    const mockUser = {
        _id: 'user123',
        Upload_Course: ['course1', 'course2'],
    };

    const mockCourses = [
        { _id: 'course1', title: 'Course 1' },
        { _id: 'course2', title: 'Course 2' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if user is not verified', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), { status: 401 }),
        });

        const req = new Request('http://localhost/api/course/uploaded');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.message).toBe('Unauthorized');
    });

    it('should return uploaded courses for verified user', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: 'user123' },
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
        (CourseModel.find as jest.Mock).mockResolvedValue(mockCourses);

        const req = new Request('http://localhost/api/course/uploaded');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe('Uploaded course fetch successfully');
        expect(json.Course).toEqual(mockCourses);
        expect(UserModel.findById).toHaveBeenCalledWith('user123');
        expect(CourseModel.find).toHaveBeenCalledWith({ _id: mockUser.Upload_Course });
    });

    it('should handle database or other internal errors', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: 'user123' },
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockRejectedValue(new Error('DB error'));

        const req = new Request('http://localhost/api/course/uploaded');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.message).toBe('Could not fetch user uploaded course');
    });
});
