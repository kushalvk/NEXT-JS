/**
 * @jest-environment node
 */

import {PATCH, POST, PUT, DELETE} from "@/app/api/course/route";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import {getVerifiedUser} from "@/utils/verifyRequest";
import {Types} from "mongoose";
import cloudinary from "@/utils/cloudinary";

jest.mock("@/utils/verifyRequest");
jest.mock("@/app/lib/dbConnect");
jest.mock("@/models/Course");
jest.mock("@/models/User");
jest.mock("@/utils/cloudinary");

const userId = new Types.ObjectId().toString();
const mockCourseId = new Types.ObjectId().toString();

function mockFormData(fields: Partial<Record<string, any>>) {
    return {
        formData: async () => ({
            get: (key: string) => {
                if (key === "Video") {
                    return {
                        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
                        name: "mock.mp4",
                    };
                }
                return fields[key] ?? null;
            },
        }),
    } as unknown as Request;
}

describe("POST /api/course", () => {
    const userId = "mockUserId";
    const mockCourseId = "mockCourseId";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockFormData = (fields: Record<string, any>) => {
        return {
            formData: async () => ({
                get: (key: string) => {
                    if (key === "Video") {
                        return {
                            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
                            name: "video.mp4",
                        };
                    }
                    if (key === "Image") {
                        return {
                            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
                            name: "image.png",
                        };
                    }
                    return fields[key] ?? null;
                },
            }),
        } as unknown as Request;
    };

    it("should return 400 if video and image are missing", async () => {
        const req = {
            formData: async () => ({
                get: () => null,
            }),
        } as unknown as Request;

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/video & image are required/i);
    });

    it("should return 400 if required text fields are missing", async () => {
        const req = mockFormData({});

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/all fields are required/i);
    });

    it("should return 400 if user document update fails", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: userId },
            errorResponse: null,
        });

        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
            secure_url: "https://mocked-cloudinary.com/resource",
        });

        (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

        (CourseModel as any).mockImplementation(() => ({
            save: jest.fn(),
            _id: mockCourseId,
        }));

        const req = mockFormData({
            Course_Name: "React",
            Description: "Learn React",
            Department: "CS",
            Video_Description: "Intro video",
            Price: "100",
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/user not able to upload course/i);
    });

    it("should return 200 if course is created successfully", async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: { _id: userId },
            errorResponse: null,
        });

        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue({
            secure_url: "https://mocked-cloudinary.com/resource",
        });

        (CourseModel as any).mockImplementation(() => ({
            save: jest.fn(),
            _id: mockCourseId,
        }));

        (UserModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
            _id: userId,
            Upload_Course: [mockCourseId],
        });

        const req = mockFormData({
            Course_Name: "React",
            Description: "Learn React",
            Department: "CS",
            Video_Description: "Intro video",
            Price: "100",
        });

        const res = await POST(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course added successfully/i);
    });
});


describe("PUT /api/course", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course Id is missing', async () => {
        const req = mockFormData({Course_Id: null});
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/course Id is required/i);
    });

    it('should return 404 if course not found', async () => {
        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: userId},
            errorResponse: null,
        });

        (CourseModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        const req = mockFormData({
            Course_Id: "mock-course-id",
            Course_Name: "React",
            Description: "Learn React",
            Department: "CS",
            Video_Description: "Intro video",
            Price: "100",
        });
        const res = await PUT(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 200 and course if course update successfully', async () => {
        const mockCourseData = {
            Course_Id: "mock-course-id",
            Course_Name: "React",
            Description: "Learn React",
            Department: "CS",
            Price: "100",
            Video: [
                {
                    Video_Url: "https://res.cloudinary.com/abc.mp4",
                    Description: "Test video",
                }
            ]
        };

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: userId},
            errorResponse: null,
        });

        (CourseModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCourseData);

        const req = mockFormData(mockCourseData);
        const res = await PUT(req);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/course updated successfully/i);
        expect(body.course).toEqual(mockCourseData);
    });
});

describe("PATCH /api/course", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if course Is, Video and Description are required', async () => {
        const req = mockFormData({});
        const res = await PATCH(req);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/Course Id , video file and description are required/i);
    });

    it('should return 404 if course not found', async () => {
        const mockFile = new File(["dummy content"], "video.mp4", {type: "video/mp4"});

        const req = mockFormData({
            Course_Id: "mock-course-id",
            Video_Description: "Some description",
            Video: mockFile,
        });

        (CourseModel.findById as jest.Mock).mockResolvedValue(null);

        const res = await PATCH(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/course not found/i);
    });

    it('should return 403 if user not authorize to buy the course', async () => {
        const mockUserId = new Types.ObjectId();
        const differentUserId = new Types.ObjectId();

        const mockCourse = {
            _id: "mock-course-id",
            Username: differentUserId.toString(),
            Video: [],
        };

        (CourseModel.findById as jest.Mock).mockResolvedValue(mockCourse);

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: mockUserId},
            errorResponse: null,
        });

        const mockFile = new File(["dummy content"], "video.mp4", {type: "video/mp4"});

        const req = mockFormData({
            Course_Id: mockCourse._id,
            Video_Description: "Testing unauthorized user",
            Video: mockFile,
        });

        const res = await PATCH(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/You are not authorized to update this course/i);
    });

    it('should return 200 if video added to course successfully', async () => {
        const mockUserId = new Types.ObjectId().toString();

        const mockCourse = {
            _id: "mock-course-id",
            Username: mockUserId,
            Video: [],
        };

        (CourseModel.findById as jest.Mock).mockResolvedValue(mockCourse);

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: mockUserId},
            errorResponse: null,
        });

        const mockCloudinaryResponse = {
            secure_url: "https://res.cloudinary.com/video.mp4"
        };

        (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockCloudinaryResponse);

        (CourseModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
            ...mockCourse,
            Video: [
                {
                    Video_Url: mockCloudinaryResponse.secure_url,
                    Description: "Test video"
                }
            ]
        });

        const mockFile = new File(["dummy content"], "video.mp4", {type: "video/mp4"});

        const req = mockFormData({
            Course_Id: mockCourse._id,
            Video_Description: "Test video",
            Video: mockFile,
        });

        const res = await PATCH(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/Video added to course/i);
        expect(body.course.Video).toHaveLength(1);
        expect(body.course.Video[0].Video_Url).toBe(mockCloudinaryResponse.secure_url);
    });
});

describe("DELETE /api/course/cart", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if Course_Id is missing', async () => {
        const req = mockFormData({}); // no courseId
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(400);
        expect(body.message).toMatch(/Course Id is required/i);
    });

    it('should return 404 if course not found', async () => {
        (CourseModel.findById as jest.Mock).mockResolvedValue(null);

        const req = mockFormData({Course_Id: "non-existent-course-id"});
        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(404);
        expect(body.message).toMatch(/Course not found/i);
    });

    it('should return 403 if user is not the owner of the course', async () => {
        const mockUserId = new Types.ObjectId();
        const courseOwnerId = new Types.ObjectId();

        const mockCourse = {
            _id: "mock-course-id",
            Username: courseOwnerId.toString(),
        };

        (CourseModel.findById as jest.Mock).mockResolvedValue(mockCourse);

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: mockUserId},
            errorResponse: null,
        });

        const req = mockFormData({
            Course_Id: mockCourse._id,
        });

        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(403);
        expect(body.message).toMatch(/not authorized/i);
    });

    it('should delete the course successfully', async () => {
        const mockUserId = new Types.ObjectId().toString();
        const mockCourseId = "mock-course-id";

        const mockCourse = {
            _id: mockCourseId,
            Username: mockUserId,
        };

        (CourseModel.findById as jest.Mock).mockResolvedValue(mockCourse);

        (getVerifiedUser as jest.Mock).mockResolvedValue({
            user: {_id: mockUserId},
            errorResponse: null,
        });

        (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
        (UserModel.updateMany as jest.Mock).mockResolvedValue({});
        (CourseModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

        const req = mockFormData({
            Course_Id: mockCourseId,
        });

        const res = await DELETE(req as any);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toMatch(/Course deleted successfully/i);
    });
});