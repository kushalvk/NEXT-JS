/**
 * @jest-environment node
 */
import { PUT, DELETE, GET } from "@/app/api/course/buy/route";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import { Types } from "mongoose";
import { getVerifiedUser } from "@/utils/verifyRequest";

const mockCourseId = new Types.ObjectId().toString();

jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/models/User");
jest.mock("@/utils/verifyRequest");

function mockFormDataWithCourseId(id: string | null) {
    return {
        formData: async () => ({
            get: (key: string) => (key === "courseId" ? id : null),
        }),
    } as unknown as Request;
}

describe("PUT /api/course/buy", () => {

    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    it("should return 400 if courseId is missing", async () => {
        const req = mockFormDataWithCourseId(null);
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toMatch(/course id is required/i);
    });

    it("should return 404 if course not found", async () => {
        (CourseModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it("should return 409 if user already bought the course", async () => {
        (CourseModel.findById as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: new Types.ObjectId(),
                Buy_Course: [{ courseId: mockCourseId }],
            },
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.message).toMatch(/already bought this course/i);
    });

    it("should return 200 on successful purchase", async () => {
        const userId = new Types.ObjectId().toString();

        (CourseModel.findById as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
                Buy_Course: [],
                Cart: [mockCourseId],
            },
            errorResponse: null,
        });

        const updatedUser = {
            _id: userId,
            Buy_Course: [{ courseId: mockCourseId }],
            Cart: [],
        };

        (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/successfully buy/i);
        expect(body.User).toEqual(updatedUser);
    });

    it("should return 500 on server error", async () => {
        (CourseModel.findById as jest.Mock).mockImplementation(() => {
            throw new Error("DB Error");
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.message).toMatch(/error at buy a course/i);
    });
});

describe("DELETE /api/course/delete", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if courseId is missing", async () => {
        const req = mockFormDataWithCourseId(null);
        const res = await DELETE(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course id is required/i);
    });

    it("should return 404 if course not found", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it("should return 409 if user has not bought the course", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: new Types.ObjectId(),
                Buy_Course: [],
            },
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req);
        const body = await res.json();

        expect(res.status).toBe(409);
        expect(body.message).toMatch(/haven't bought this course/i);
    });

    it("should return 200 if course removed successfully", async () => {
        const userId = new Types.ObjectId().toString();

        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
                Buy_Course: [{ courseId: mockCourseId }],
            },
            errorResponse: null,
        });

        const updatedUser = {
            _id: userId,
            Buy_Course: [],
        };

        (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/removed from your purchased list/i);
        expect(body.User).toEqual(updatedUser);
    });

    it("should return 500 if internal error occurs", async () => {
        (CourseModel.findOne as jest.Mock).mockImplementation(() => {
            throw new Error("DB error");
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.message).toMatch(/error at deleting course/i);
    });
});

describe("GET /api/course/buy", () => {
    it("should return 200 and include total VideoLength", async () => {
        const userId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: userId },
            errorResponse: null,
        });

        const mockUserDoc = {
            _id: userId,
            Buy_Course: [
                {
                    courseId: {
                        _id: "course1",
                        Course_name: "React",
                        Image: "react.png",
                        Description: "Learn React",
                        Video: [{}, {}, {}], // 3 videos
                    },
                },
                {
                    courseId: {
                        _id: "course2",
                        Course_name: "Node",
                        Image: "node.png",
                        Description: "Learn Node.js",
                        Video: [{}], // 1 video
                    },
                },
            ],
        };

        (UserModel.findById as jest.Mock).mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockUserDoc),
        });

        const req = {} as Request;
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/fetch successfully/i);
    });

    it("should return 500 on server error", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: "some-user-id" },
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockImplementation(() => {
            throw new Error("DB Error");
        });

        const req = {} as Request;
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(500);
        expect(body.success).toBe(false);
        expect(body.message).toMatch(/error at getting course/i);
    });
});