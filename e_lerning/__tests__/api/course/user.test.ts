/**
 * @jest-environment node
 */

import { GET } from "@/app/api/course/user/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

jest.mock("@/app/lib/dbConnect");
jest.mock("@/utils/verifyRequest");
jest.mock("@/models/Course");

describe("GET /api/course/user", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and course if found', async () => {
        const userId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
            },
            errorResponse: null,
        });

        (CourseModel.find as jest.Mock).mockResolvedValue({Username: userId});

        const res = await GET({} as  Request);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course found/i);
    });
});