import {Course, Video} from "@/models/Course";
import {User} from "@/models/User";
import {Types} from "mongoose";

export interface CommonApiResponse {
    success: boolean;
    message: string;
}

// AUTH
export interface LoginData {
    Username: string;
    Password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    UserToken: string;
}

// COURSE
export interface CourseResponse {
    success: boolean,
    message: string,
    course: CourseCard,
}

export interface CourseIdData {
    courseId: string;
}

export interface UserResponse {
    success: boolean,
    message: string,
    User: User
}

export interface CourseCard {
    _id: Types.ObjectId;
    Image: string;
    Course_Name: string;
    Description: string;
    Department: string;
    Price: number;
    Username: {
        _id: Types.ObjectId;
        Username: string;
    };
    Video: Video[];
}