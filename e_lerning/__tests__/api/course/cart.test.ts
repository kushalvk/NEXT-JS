/**
 * @jest-environment node
 */
import {POST, DELETE, GET} from "@/app/api/course/cart/route";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {Types} from "mongoose";

jest.mock("@/utils/verifyRequest");
jest.mock("@/models/Course");
jest.mock("@/models/User");
jest.mock("@/app/lib/dbConnect");

const mockCourseId = new Types.ObjectId().toString();

function mockFormDataWithCourseId(id: string | null) {
    return {
        formData: async () => ({
            get: (key: string) => (key === "courseId" ? id : null),
        }),
    } as unknown as Request;
}

describe("POST /api/course/cart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 id course Id is missing', async () => {
        const req = mockFormDataWithCourseId(null);
        const response = await POST(req as any);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toMatch(/Course Id is required/i);
    });

    it('should return 404 if course not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await POST(req as any);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 404 if user not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({_id: mockCourseId});

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it('should return 200 and update user\'s cart successfully', async () => {
        const mockUser = {
            _id: new Types.ObjectId(),
            Cart: [],
        };

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: mockUser,
            errorResponse: null
        });

        const updatedUeer = {
            _id: new Types.ObjectId().toString(),
            Cart: [mockCourseId]
        };

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUeer);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await POST(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/added to cart/i);
        expect(body.User).toEqual(updatedUeer);
    });
});

describe("DELETE /api/course/cart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course Id is missing', async () => {
        const req = mockFormDataWithCourseId(null);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course id is required/i);
    });

    it('should return 404 if course not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 404 if user not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({_id: mockCourseId});

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it('should return 404 if course id is not in user\'s cart', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: new Types.ObjectId(),
                Cart: []
            },
            errorResponse: null
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/Course doesn't exist in your cart./i);
    });

    it('should return 200 and updated User\'s cart successfully', async () => {
        const userId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
                Cart: [mockCourseId]
            },
            errorResponse: null
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            _id: userId,
            Cart: []
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course remove from cart successfully/i);
        expect(body.User).toEqual({
            _id: userId,
            Cart: []
        })
    });
});

describe("GET /api/course/cart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if user not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({_id: mockCourseId});

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await GET(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it('should return 400 if user\'s cart is empty', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: new Types.ObjectId(),
                Cart: []
            },
            errorResponse: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await GET(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/your cart is empty/i);
    });

    it('should return 200 and user\'s cart data successfully', async () => {
        const userId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
                Cart: [mockCourseId]
            },
            errorResponse: null,
        });

        (CourseModel.find as jest.Mock).mockResolvedValue({ _id: mockCourseId });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await GET(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/cart fetch successfully/i);
        expect(body.Cart).toEqual({
            _id: mockCourseId
        });
    });
});