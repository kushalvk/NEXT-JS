/**
 * @jest-environment node
 */

import { PUT, DELETE } from "@/app/api/favourite/route";
import { getVerifiedUser } from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import { Types } from "mongoose";

jest.mock("@/utils/verifyRequest");
jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/models/User");

const mockCourseId = new Types.ObjectId().toString();

function mockJsonRequest(jsonBody: any): Request {
    return {
        json: async () => jsonBody,
    } as unknown as Request;
}

describe("PUT /api/favourite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if course Id is missing", async () => {
        const req = mockJsonRequest({});
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course id is required/i);
    });

    it("should return 404 if course is not found", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockJsonRequest({ courseId: mockCourseId });
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it("should return 404 if user not found", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: null,
        });

        const req = mockJsonRequest({ courseId: mockCourseId });
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it("should return 200 and updated user if course added to favourite", async () => {
        const mockUserId = new Types.ObjectId().toString();

        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: mockUserId },
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Favourite: [mockCourseId],
        });

        const req = mockJsonRequest({ courseId: mockCourseId });
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course added to favourite successfully/i);
        expect(body.User).toHaveProperty("Favourite");
    });
});

describe("DELETE /api/favourite", () => {
    const mockCourseId = "course123";
    const mockUserId = "user123";

    const mockRequest = {
        json: jest.fn().mockResolvedValue({ courseId: mockCourseId }),
    } as any as Request;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should remove course from favourites and return success", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: mockUserId },
        });
        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Favourite: [],
        });

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe("Course remove from favourite Successfully");
    });

    it("should return 400 if courseId is missing", async () => {
        const badRequest = {
            json: jest.fn().mockResolvedValue({}),
        } as any as Request;

        const response = await DELETE(badRequest);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.message).toBe("Course Id is required");
    });

    it("should return 404 if course is not found", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.message).toBe("Course not Found");
    });

    it("should return 404 if user is not found", async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({ _id: mockCourseId });
        (getVerifiedUser as jest.Mock).mockResolvedValue({ user: null });

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(404);
        expect(json.message).toBe("User Not Found");
    });

    it("should return 500 on internal error", async () => {
        (CourseModel.findOne as jest.Mock).mockRejectedValue(new Error("DB error"));

        const response = await DELETE(mockRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.message).toBe("Error at removing from favourite");
    });
});