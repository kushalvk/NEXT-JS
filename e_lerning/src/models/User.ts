import mongoose, {Document, Schema, Types} from "mongoose";

export interface BuyCourse extends Document {
    courseId: mongoose.Types.ObjectId;
    buyDate: Date;
}

const Buy_Course_Schema = new Schema<BuyCourse>({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "courses",
        required: true,
    },
    buyDate: {
        type: Date,
        default: Date.now,
    },
}, {_id: false});

export interface WatchedCourse extends Document {
    courseId: mongoose.Types.ObjectId;
    completedVideos: mongoose.Types.ObjectId[];
    completedAt?: Date | null;
}

const Watched_Course_Schema = new Schema<WatchedCourse>({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "courses",
        required: true,
    },
    completedVideos: [{
        type: Schema.Types.ObjectId,
        required: true,
    }],
    completedAt: {
        type: Date,
        default: null,
    }
}, {_id: false})

export interface Certifiate extends Document {
    courseId: mongoose.Types.ObjectId;
    issuedAt: Date;
}

const Certificate_Schema = new Schema<Certifiate>({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "courses",
        required: true,
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    }
}, {_id: false});

export interface User extends Document {
    Username: string;
    Password: string;
    Email: string;
    Full_name: string;
    Favourite: Types.ObjectId[];
    Cart: Types.ObjectId[];
    Upload_Course: Types.ObjectId[];
    Buy_Course: BuyCourse[];
    Watched_Course: WatchedCourse[];
    Certificate: Certifiate[];
    createdAt: Date;
}

const UserSchema: Schema<User> = new Schema({
    Username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true
    },
    Password: {
        type: String,
        required: [true, 'Password is required'],
    },
    Email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please use a valid email address']
    },
    Full_name: {
        type: String,
        default: "",
        trim: true,
    },
    Favourite: [{
        type: Schema.Types.ObjectId,
        ref: 'courses',
        default: [],
    }],
    Cart: [{
        type: Schema.Types.ObjectId,
        ref: 'courses',
        default: [],
    }],
    Upload_Course: [{
        type: Schema.Types.ObjectId,
        ref: 'courses',
        default: [],
    }],
    Buy_Course: [Buy_Course_Schema],
    Watched_Course: [Watched_Course_Schema],
    Certificate: [Certificate_Schema],
}, { timestamps: true });

const UserModel = mongoose.models.users || mongoose.model<User>('users', UserSchema);

export default UserModel;