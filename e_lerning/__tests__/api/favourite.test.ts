/**
 * @jest-environment node
 */

import { PUT } from "@/app/api/favourite/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";
import Course from "@/models/Course";
import any = jasmine.any;

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

describe("PUT /api/favourite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if course Id is missing", async () => {
        const req = mockFormDataWithCourseId(null);
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course id is required/i);
    });

    it('should return 404 if course is not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await PUT(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should 404 if user not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
        });

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: null,
        });

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await PUT(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/user not found/i);
    });

    it('should return 200 and User if course added to favourite', async () => {
        const mockUserId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: mockUserId
            },
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            _id: mockUserId,
            Favourite: [mockCourseId]
        })

        const req = mockFormDataWithCourseId(mockCourseId);
        const res = await PUT(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.message).toMatch(/course added to favourite successfully/i);
    });
})