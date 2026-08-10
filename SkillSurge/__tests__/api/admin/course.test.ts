/**
 * @jest-environment node
 */

import { GET } from "@/app/api/admin/course/route";
import CourseModel from "@/models/Course";
import { getVerifiedUser } from "@/utils/verifyRequest";
import { Types } from "mongoose";

jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/utils/verifyRequest");

const request = () => new Request("http://localhost/api/admin/course");

/** The route chains .select().populate().sort().lean(). */
const mockFindChain = (result: unknown) => {
    const chain = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result),
    };
    (CourseModel.find as jest.Mock).mockReturnValue(chain);
    return chain;
};

describe("GET /api/admin/course", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("rejects a caller who is not signed in", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
            errorResponse: Response.json({ success: false, message: "No token provided" }, { status: 401 }),
        });

        const res = await GET(request());

        expect(res.status).toBe(401);
    });

    it("rejects a signed-in caller who is not the admin", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: "u1", Username: "someone" },
            errorResponse: null,
        });

        const res = await GET(request());
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/not authorized/i);
    });

    it("returns the courses for the admin", async () => {
        const mockCourseData = [{
            _id: new Types.ObjectId().toString(),
            Course_Name: "JS",
            Department: "IT",
            Price: 7000,
        }];

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: "admin-id", Username: "Admin" },
            errorResponse: null,
        });
        mockFindChain(mockCourseData);

        const res = await GET(request());
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.message).toMatch(/all course found/i);
        expect(body.course).toEqual(mockCourseData);
    });
});
