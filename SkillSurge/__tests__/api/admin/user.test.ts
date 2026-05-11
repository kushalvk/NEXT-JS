/**
 * @jest-environment node
 */

import {GET, DELETE} from "@/app/api/admin/users/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

function mockFormDataUserId(id: string | null) {
    return {
        formData: async () => ({
            get: (key: string) => (key === "user_Id" ? id : null),
        }),
    } as unknown as Request;
}

jest.mock("@/utils/verifyRequest");
jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/models/User");

describe("GET /api/admin/users", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not admin', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "RegularUser"},
            errorResponse: null,
        });

        (UserModel.find as jest.Mock).mockResolvedValue([]);

        const req = {} as Request;
        const res = await GET(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/You are not authorized to get all Users/i);
    });

    it("should return 200 and Users if users are found", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "Admin"},
            errorResponse: null,
        });

        const mockUsers = [
            {
                Username: "abc",
                Email: "abc@gmail.com",
            },
        ];

        (UserModel.find as jest.Mock).mockResolvedValue(mockUsers);

        const req = {} as Request;
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/users found/i);
        expect(body.Users).toEqual(mockUsers);
    });
});

describe("DELETE /api/admin/user", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if User Id is missing', async () => {
        const req = mockFormDataUserId(null);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/user Id is required/i);
    });

    it('should return 403 if user not authorized', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "RegularUser"},
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataUserId(new Types.ObjectId().toString());
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/You are not authorized to delete Users/i);
    });

    it('should return 403 if user is not for delete', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "Admin"},
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockResolvedValue({
            Username: "Admin",
        });

        const req = mockFormDataUserId(new Types.ObjectId().toString());
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/this user is not for delete/i);
    });

    it("should return 200 if user deleted successfully", async () => {
        const mockUserId = new Types.ObjectId().toString();

        const mockUserDoc = {
            _id: mockUserId,
            Username: "randomUser",
            Upload_Course: ["course1", "course2"],
        };

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { Username: "Admin" },
            errorResponse: null,
        });

        (UserModel.findById as jest.Mock).mockResolvedValue(mockUserDoc);

        (CourseModel.deleteMany as jest.Mock).mockResolvedValue({});

        (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

        const req = mockFormDataUserId(mockUserId);
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/user deleted successfully/i);
    });
});