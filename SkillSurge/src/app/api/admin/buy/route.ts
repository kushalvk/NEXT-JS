import dbConnect from "@/app/lib/dbConnect";
import {getVerifiedUser} from "@/utils/verifyRequest";
import UserModel from "@/models/User";

export async function GET(req: Request) {
    await dbConnect();

    try {
        const {user, errorResponse} = await getVerifiedUser(req);
        if (errorResponse) return errorResponse;

        if (user.Username !== "Admin") {
            return Response.json({
                success: false,
                message: "You are not authorized to get all Users who buy course",
            }, {status: 403});
        }

        const Result = await UserModel.aggregate([
            // 1. Match only users who have at least one course purchase
            {
                $match: {
                    Buy_Course: {$exists: true, $not: {$size: 0}}
                }
            },
            // 2. Unwind Buy_Course array to create one document per purchase
            {
                $unwind: "$Buy_Course"
            },
            // 3. Lookup course details from Course collection
            {
                $lookup: {
                    from: "courses", // use actual collection name
                    localField: "Buy_Course.courseId",
                    foreignField: "_id",
                    as: "CourseInfo"
                }
            },
            // 4. Flatten CourseInfo array (since it's returned as an array)
            {
                $unwind: "$CourseInfo"
            },
            // 5. Sort all purchases globally by latest buyDate first
            {
                $sort: {
                    "Buy_Course.buyDate": -1
                }
            },
            // 6. Final projection: what fields to show in output
            {
                $project: {
                    _id: 0,
                    Username: 1,
                    Email: 1,
                    course: {
                        _id: "$CourseInfo._id",
                        title: "$CourseInfo.Course_Name",
                        buyDate: "$Buy_Course.buyDate"
                    }
                }
            }
        ]);

        return Response.json({
            success: true,
            message: "fetch Successfully all user who by the courses",
            Result
        }, {status: 200});
    } catch (error) {
        console.error("Error at fetch user buy course ", error);
        return Response.json({
            success: false,
            message: "Error at fetch user buy course",
        }, {status: 500});
    }
}