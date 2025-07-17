import mongoose, {Document, Schema, Types} from "mongoose";

export interface Video extends Document {
    Video_Url: string;
    Description: string;
}

const VideoSchema: Schema<Video> = new Schema({
    Video_Url: {
        type: String,
        required: [true, 'Video URL is required'],
        trim: true,
    },
    Description: {
        type: String,
        required: [true, 'Description is required'],
    }
})

export interface Course extends Document {
    Image: string;
    Course_Name: string;
    Description: string;
    Department: string;
    Price: number;
    Username: Types.ObjectId;
    Video: Video[];
}

const CourseSchema: Schema<Course> = new Schema({
    Image: {
        type: String,
        trim: true,
    },
    Course_Name: {
        type: String,
        required: [true, 'Course Name is required'],
        trim: true,
    },
    Description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    Department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
    },
    Price: {
        type: Number,
        default: 0,
    },
    Username: [{
        type: Types.ObjectId,
        required: [true, 'Username is required'],
        ref: 'users',
        trim: true,
    }],
    Video: [VideoSchema],
})

const CourseModel = mongoose.models.courses || mongoose.model<Course>('courses', CourseSchema);

export default CourseModel;