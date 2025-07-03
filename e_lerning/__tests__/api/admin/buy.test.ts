/**
 * @jest-environment node
 */

import {GET} from "@/app/api/admin/buy/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

jest.mock("@/utils/verifyRequest", () => ({
    getVerifiedUser: jest.fn(),
}));

jest.mock("@/models/User", () => ({
    aggregate: jest.fn(),
}));

jest.mock("@/app/lib/dbConnect", () => jest.fn());

describe("GET /api/admin/users", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 403 if user is not Admin", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "NotAdmin"},
            errorResponse: null,
        });

        const req = {} as Request;
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/not authorized/i);
    });

    it("should return 200 with user and course data if admin", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {Username: "Admin"},
            errorResponse: null,
        });

        const mockResult = [
            {
                Username: "john123",
                Email: "john@example.com",
                course: {
                    _id: "courseId123",
                    title: "React Basics",
                    buyDate: "2024-06-01T00:00:00.000Z",
                },
            },
        ];

        (UserModel.aggregate as jest.Mock).mockResolvedValue(mockResult);

        const req = {} as Request;
        const res = await GET(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/fetch successfully/i);
        expect(body.Result).toEqual(mockResult);
    });
});