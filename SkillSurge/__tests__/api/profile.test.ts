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

describe("PUT /api/updateProfile", () => {
    const mockUser = {
        _id: "user123",
        Username: "oldUser",
        Email: "old@example.com",
        Full_name: "Old Name",
        RazorpayId: "old-razorpay",
    };

    const updatedUser = {
        _id: "user123",
        Username: "newUser",
        Email: "new@example.com",
        Full_name: "New Name",
        RazorpayId: "new-razorpay",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if user is not verified", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: new Response(
                JSON.stringify({ success: false, message: "Unauthorized" }),
                { status: 401 }
            ),
        });

        const formData = new FormData();
        formData.append("Username", "newUser");

        const req = {} as NextRequest;

        const res = await PUT(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Unauthorized");
    });

    it("should update user profile successfully", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: "user123" },
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

        const formData = new FormData();
        formData.append("Username", "newUser");
        formData.append("Email", "new@example.com");
        formData.append("Full_name", "New Name");
        formData.append("RazorpayId", "new-razorpay");

        // ✅ use native Request with body = formData
        const req = new Request("http://localhost/api/updateProfile", {
            method: "PUT",
            body: formData,
        });

        const res = await PUT(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe("User Updated");
        expect(json.user).toEqual(updatedUser);

        expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "user123",
            {
                Username: "newUser",
                Email: "new@example.com",
                Full_name: "New Name",
                RazorpayId: "new-razorpay",
            },
            { new: true }
        );
    });

    it("should return 500 on internal server error", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: "user123" },
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(
            new Error("DB error")
        );

        const formData = new FormData();
        formData.append("Username", "newUser");

        const req = {} as NextRequest;

        const res = await PUT(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Error at updating Profile");
    });
});
