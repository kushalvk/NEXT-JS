/**
 * @jest-environment node
 */

import { GET } from "@/app/api/admin/course/route";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");

describe("GET /api/admin/course", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if course not found', async () => {
        (CourseModel.find as jest.Mock).mockResolvedValue(null);

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 200 and course if course found', async () => {
        const mockCourseData = {
            _id: new Types.ObjectId().toString(),
            Course_Name: "JS",
            Description: "Basic JS",
            Department: "IT",
            Price: 7000,
            Username: [ new Types.ObjectId().toString() ],
            Video: [
                {
                    Video_Url: "https://res.cloudinary.com/abc.mp4",
                    Description: "JS 2",
                    _id: new Types.ObjectId().toString()
                }
            ]
        };

        (CourseModel.find as jest.Mock).mockResolvedValue({mockCourseData});

        const res = await GET();
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.message).toMatch(/all course found/i);
        expect(body.course).toEqual({mockCourseData});
    });
});