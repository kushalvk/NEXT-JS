/**
 * @jest-environment node
 */
import { PUT, DELETE } from "@/app/api/course/buy/route";
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
