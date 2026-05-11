/**
 * @jest-environment node
 */
import { GET } from "@/app/api/course/id/[id]/route";
import CourseModel from "@/models/Course";
import { Types } from "mongoose";

jest.mock("@/app/lib/dbConnect", () => jest.fn());
jest.mock("@/models/Course", () => ({
    findById: jest.fn().mockReturnThis(),
    populate: jest.fn(),
}));

describe("GET /api/course/[id]", () => {
    const mockCourse = {
        _id: new Types.ObjectId().toString(),
        name: "Test Course",
        Username: { Username: "test_user" },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if id param is missing", async () => {
        const req = {} as Request;
        const params = { id: null as any };

        const res = await GET(req, { params });
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Department required");
    });

    it("should return 404 if course not found", async () => {
        (CourseModel.findById as jest.Mock).mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null),
        });

        const req = {} as Request;
        const id = new Types.ObjectId();
        const res = await GET(req, { params: { id } });
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.success).toBe(false);
        expect(json.message).toBe("No courses found for this id");
    });

    it("should return course data if course is found", async () => {
        (CourseModel.findById as jest.Mock).mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(mockCourse),
        });

        const req = {} as Request;
        const res = await GET(req, { params: { id: mockCourse._id } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe("Courses fetched successfully");
        expect(json.course).toEqual(mockCourse);
    });

    it("should return 500 on server error", async () => {
        (CourseModel.findById as jest.Mock).mockImplementationOnce(() => {
            throw new Error("DB error");
        });

        const req = {} as Request;
        const res = await GET(req, { params: { id: new Types.ObjectId() } });
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.success).toBe(false);
        expect(json.message).toBe("Server error while fetching courses");
    });
});
