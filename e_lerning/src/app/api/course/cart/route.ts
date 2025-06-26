import dbConnect from "@/app/lib/dbConnect";
import CourseModel from "@/models/Course";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("courseId")?.toString() || null;

        if (!courseId) {
            return Response.json({
                success: false,
                message: "Course Id is required",
            }, {status: 400});
        }

        const course = await CourseModel.findOne({_id: courseId});

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not Found",
            }, {status: 404});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found",
            }, {status: 404});
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$push: {Cart: courseId}},
            {new: true}
        );

        return Response.json({
            success: true,
            message: "Course added to cart Successfully",
            User: updatedUser,
        }, {status: 200});
    } catch (error) {
        console.error("Error at add to cart ", error);
        return Response.json({
            success: false,
            message: "Error at add to cart ",
        }, {status: 500});
    }
}

export async function DELETE(req: Request) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const courseId = formData.get("courseId")?.toString() || null;

        if (!courseId) {
            return Response.json({
                success: false,
                message: "Course Id is required",
            }, {status: 400});
        }

        const course = await CourseModel.findOne({_id: courseId});

        if (!course) {
            return Response.json({
                success: false,
                message: "Course not Found",
            }, {status: 404});
        }

        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found",
            }, {status: 404});
        }

        if (!user.Cart.includes(courseId)) {
            return Response.json({
                success: false,
                message: "Course doesn't exist in your cart.",
            }, {status: 404});
        }

        const upadtedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {$pull: {Cart: courseId}},
            {new: true}
        )

        return Response.json({
            success: true,
            message: "Course remove from cart Successfully",
            User: upadtedUser
        }, {status: 200});
    } catch (error) {
        console.error("Error at remove course from cart ", error);
        return Response.json({
            success: false,
            message: "Error at remove course from cart",
        }, {status: 500});
    }
}

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (!user) {
            return Response.json({
                success: false,
                message: "User Not Found",
            }, {status: 404});
        }

        if (user.Cart.length === 0) {
            return Response.json({
                success: true,
                message: "Your cart is empty",
            }, {status: 200});
        }

        const Cart = await CourseModel.find({_id: user.Cart});

        return Response.json({
            success: true,
            message: "Cart fetch successfully",
            Cart
        }, {status: 200});
    } catch (error) {
        console.error("Error at fetching Cart ", error)
        return Response.json({
            success: false,
            message: "Error at fetching Cart",
        }, {status: 500});
    }
}