/**
 * @jest-environment node
 */

import { POST } from "@/app/api/certificate/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

jest.mock("@/utils/verifyRequest");
jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/models/User");

const mockCourseId = new Types.ObjectId().toString();

function mockFormDataWithCourseId(id: string | null) {
    return {
        formData: async () => ({
            get: (key: string) => (key === "courseId" ? id : null),
        }),
    } as unknown as Request;
}

describe("POST /api/certificate", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course Id is missing', async () => {
        const req = mockFormDataWithCourseId(null);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course Id is required/i);
    });

    it('should return 403 if user has not bought this course', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [],
                Watched_Course: [],
                Certificate: [],
            },
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/Your are not bought this course/i);
    });

    it('should return 404 if course not found', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [mockCourseId],
                Watched_Course: [],
                Certificate: [],
            },
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 404 if user not found', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [mockCourseId],
                Watched_Course: [],
                Certificate: [],
            },
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Video: [{}, {}],
        });

        (UserModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it('should return 409 if user already issued certificate', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [mockCourseId],
                Watched_Course: [{ courseId: mockCourseId, completedVideos: [1, 2] }],
                Certificate: [{ courseId: mockCourseId, issuedAt: new Date() }],
            },
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Video: [{}, {}],
        });

        (UserModel.findById as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Watched_Course: [{ courseId: mockCourseId, completedVideos: [1, 2] }],
            Certificate: [{ courseId: mockCourseId, issuedAt: new Date() }],
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(409);
        expect(body.message).toMatch(/Certificate already issued for this course/i);
    });

    it('should return 403 if not complete course', async () => {
        const mockUserId = new Types.ObjectId().toString();

        (CourseModel.findById as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Video: [{}, {}, {}],
        });

        (UserModel.findById as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Watched_Course: [{
                courseId: mockCourseId,
                completedVideos: [1],
            }],
            Certificate: [],
        });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [mockCourseId],
                Watched_Course: [],
                Certificate: [],
            },
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/You must complete all videos to get the certificate/i);
    });

    it('should return 200 if certificate issued successfully', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId,
                Buy_Course: [mockCourseId],
                Watched_Course: [{ courseId: mockCourseId, completedVideos: [1, 2] }],
                Certificate: [],
            },
            errorResponse: null,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Video: [{}, {}],
        });

        (UserModel.findById as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Watched_Course: [{ courseId: mockCourseId, completedVideos: [1, 2] }],
            Certificate: [],
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Certificate: [{ courseId: mockCourseId, issuedAt: new Date() }],
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/Certificate issued successfully/i);
        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            mockUserId,
            {
                $push: {
                    Certificate: {
                        courseId: mockCourseId,
                        issuedAt: expect.any(Date),
                    },
                },
            }
        );
    });
});