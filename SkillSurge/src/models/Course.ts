import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface Video {
    Video_Url: string;
    Description: string;
}

const VideoSchema = new Schema<Video>(
    {
        Video_Url: {
            type: String,
            required: [true, 'Video URL is required'],
            trim: true,
        },
        Description: {
            type: String,
            required: [true, 'Description is required'],
        }
    },
    { _id: false } // Prevents automatic _id for subdocuments unless needed
);

export interface Course extends Document {
    Image: string;
    Course_Name: string;
    Description: string;
    Department: string;
    Price: number;
    Username: Types.ObjectId;
    Video: Video[];
}

const CourseSchema = new Schema<Course>(
    {
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
        Username: {
            type: Schema.Types.ObjectId,
            required: [true, 'Username is required'],
            ref: 'users',
        },
        Video: {
            type: [VideoSchema],
            default: [],
        },
    },
    { timestamps: true }
);

/**
 * Indexes. Without these every catalogue request is a full collection scan.
 *  - createdAt: the default catalogue sort.
 *  - Department + createdAt: the category listings, sorted.
 *  - Username: "courses I uploaded", and the ownership checks.
 *  - text: name/description search.
 */
CourseSchema.index({createdAt: -1});
CourseSchema.index({Department: 1, createdAt: -1});
CourseSchema.index({Username: 1});
CourseSchema.index({Course_Name: 'text', Description: 'text'}, {weights: {Course_Name: 5, Description: 1}});

const CourseModel: Model<Course> =
    mongoose.models.courses || mongoose.model<Course>('courses', CourseSchema);

export default CourseModel;