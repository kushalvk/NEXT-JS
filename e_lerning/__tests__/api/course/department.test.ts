/**
 * @jest-environment node
 */
import {GET} from "@/app/api/course/[department]/route";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";

jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");

describe("GET /api/course/[department]", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if department is missing', async () => {

        const response = await GET({} as Request, { params: { department: ''}});
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toMatchObject({
            success: false,
        });
        expect(body.message).toMatch(/Department required/i);
    });

    it('should return 404 if course not find with this department', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue([]);

        const response = await GET({} as any, {params: {department: 'IT'}});

        const body = await response.json();
        expect(response.status).toBe(404);
        expect(body).toMatchObject({
            success: false,
            message: expect.stringMatching(/No courses found for this department/i),
        })
    });

    it('should return 200 and course list if found', async () => {
        const mockCourse = [
            {
                _id: new Types.ObjectId(),
                Course_Name: 'JS',
                Description: 'Basic JS',
                Department: 'IT',
                Price: 7000,
                Username: [new Types.ObjectId()],
                Video: [
                    {
                        _id: new Types.ObjectId(),
                        Video_Url: 'https://example.com/js1.mp4',
                        Description: 'JS Intro'
                    }
                ],
                __v: 0
            }
        ];

        (CourseModel.find as jest.Mock).mockResolvedValue(mockCourse);

        const serializedMock = JSON.parse(JSON.stringify(mockCourse));

        const response = await GET({} as Request, {params: {department: 'IT'}})

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({
            success: true,
            message: expect.stringMatching(/Courses fetched successfully/i),
            course: serializedMock,
        });
    });
});