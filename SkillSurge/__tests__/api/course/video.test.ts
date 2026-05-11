/**
 * @jest-environment node
 */

import {PUT} from "@/app/api/course/video/route";
import {getVerifiedUser} from "@/utils/verifyRequest";
import CourseModel from "@/models/Course";
import {Types} from "mongoose";
import { writeFile, unlink } from "fs/promises";
import cloudinary from "@/utils/cloudinary";
import path from "path";

jest.mock("@/utils/verifyRequest");
jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/User");
jest.mock("@/models/Course");
jest.mock("fs/promises");
jest.mock("@/utils/cloudinary");

const mockCourseId = new Types.ObjectId().toString();

function mockFormDataWithCourseId(id: string | null) {
    return {
        formData: async () => ({
            get: (key: string) => {
                if (key === "courseId") return id;
                if (key === "Video_Description") return "Test video";
                if (key === "Video") {
                    return {
                        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
                        name: "mock.mp4",
                    };
                }
                return null;
            },
        }),
    } as unknown as Request;
}

describe('PUT /api/course/video', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course id is missing', async () => {
        const req = mockFormDataWithCourseId(null);
        const response = await PUT(req as any);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toMatch(/Course Id is required/i);
    });

    it('should return 404 if course not found', async () => {
        (CourseModel.findOne as jest.Mock).mockResolvedValue(null);

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req as any);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 403 if loggedIn user not authorized to update the course', async () => {
        const userId = new Types.ObjectId().toString();
        const anotherUserId = new Types.ObjectId().toString();

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {
                _id: userId,
            },
            errorResponse: null,
        });

        (CourseModel.findOne as jest.Mock).mockResolvedValue({
            Username: anotherUserId, // <- Different from logged-in user
        });

        // Mock file and Video_Description to avoid .arrayBuffer() error
        const req = {
            formData: async () => ({
                get: (key: string) => {
                    if (key === "courseId") return mockCourseId;
                    if (key === "Video_Description") return "Test video";
                    if (key === "Video") {
                        return {
                            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
                            name: "mock.mp4"
                        };
                    }
                    return null;
                },
            }),
        } as unknown as Request;

        const response = await PUT(req);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.message).toMatch(/you are not authorized to update this course/i);
    });

    it("should return 200 and course if update successfully", async () => {
        const userId = new Types.ObjectId().toString();

        // Mock getVerifiedUser
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: userId },
            errorResponse: null,
        });

        // Mock CourseModel.findOne
        (CourseModel.findOne as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Username: userId,
        });

        // Mock CourseModel.findOneAndUpdate
        (CourseModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
            _id: mockCourseId,
            Video: [
                {
                    Video_Url: "https://mocked-cloudinary.com/video.mp4",
                    Description: "Test video",
                },
            ],
        });

        // Mock fs/promises writeFile and unlink
        (writeFile as jest.Mock).mockResolvedValue(undefined);
        (unlink as jest.Mock).mockResolvedValue(undefined);

        // Mock cloudinary.uploader.upload
        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
            secure_url: "https://mocked-cloudinary.com/video.mp4",
        });

        // Mock path.join to return a consistent path
        jest.spyOn(path, "join").mockReturnValue("/mocked/path/mock.mp4");

        const req = mockFormDataWithCourseId(mockCourseId);
        const response = await PUT(req as any);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course updated successfully/i);
        expect(body.course).toEqual({
            _id: mockCourseId,
            Video: [
                {
                    Video_Url: "https://mocked-cloudinary.com/video.mp4",
                    Description: "Test video",
                },
            ],
        });
    });
});