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
});

export interface User extends Document {
    Username: string;
    Password: string;
    Email: string;
    Full_name: string;
    Cart: Types.ObjectId[];
    Upload_Course: Types.ObjectId[];
    Buy_Course: BuyCourse[];
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
    Buy_Course: [Buy_Course_Schema]
})

const UserModel = mongoose.models.users || mongoose.model<User>('users', UserSchema);

export default UserModel;