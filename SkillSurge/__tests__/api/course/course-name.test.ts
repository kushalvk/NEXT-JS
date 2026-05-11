/**
 * @jest-environment node
 */

import { GET } from "@/app/api/course/name/[course_name]/route";
import CourseModel from "@/models/Course";

jest.mock("@/models/Course");
jest.mock("@/app/lib/dbConnect");

describe("GET /api/course/name/[course_name]", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course name is missing', async () => {
        const res = await GET({} as Request, { params: { course_name: ''}});
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/Course Name is required/i);
    });

    it('should return 404 if course not found with this name', async () => {
        (CourseModel.find as jest.Mock).mockResolvedValue([])

        const res = await GET({} as Request, { params: { course_name: 'JS'}});
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/no courses found for this name/i);
    });

    it('should return 200 and course if found', async () => {
        (CourseModel.find as jest.Mock).mockResolvedValue([{Course_Name: 'JS'}]);

        const res = await GET({} as Request, { params: { course_name: 'JS'}});
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/Courses fetched successfully/i);
        expect(body.course).toEqual([{Course_Name: 'JS'}]);
    });
});