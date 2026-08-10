/**
 * Seeds the read-only demo account and its data.
 *
 *   npm run seed:demo
 *
 * Re-running is safe: the demo user and every course it owns are removed and
 * recreated, so the demo always starts from the same state.
 *
 * Written as plain ESM (not TypeScript) on purpose - the repo is
 * "type": "commonjs" with "module": "esnext", so a .ts script would hit the
 * same loader problem that currently breaks jest.config.ts. Documents are
 * written through the native driver rather than the Mongoose models, which
 * keeps the script independent of the TS path aliases in src/.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "Demo@1234";
const DEMO_EMAIL = "demo@skillsurge.dev";
const DEMO_FULL_NAME = "Demo User";

const { ObjectId } = mongoose.Types;

// Publicly hosted sample media (Cloudinary's demo cloud + Unsplash). The image
// hosts must stay in sync with images.remotePatterns in next.config.ts.
const CDN = "https://res.cloudinary.com/demo/video/upload";
const IMG = "https://images.unsplash.com";

const demoCourses = [
    {
        Course_Name: "Modern React from Scratch",
        Description:
            "Build production-ready interfaces with React 19 - components, hooks, state management and data fetching, all the way to a deployed app.",
        Department: "Web Development",
        Price: 1499,
        Image: `${IMG}/photo-1498050108023-c5249f4df085?w=1200&q=80`,
        Video: [
            { Video_Url: `${CDN}/dog.mp4`, Description: "01 - Course tour and setting up your environment" },
            { Video_Url: `${CDN}/elephants.mp4`, Description: "02 - Components, props and JSX in depth" },
            { Video_Url: `${CDN}/sea_turtle.mp4`, Description: "03 - Hooks, effects and shipping your first app" },
        ],
    },
    {
        Course_Name: "Node.js & MongoDB REST APIs",
        Description:
            "Design and ship REST APIs with Node.js, Express and MongoDB. Covers schema design, authentication with JWT and deploying to production.",
        Department: "Web Development",
        Price: 1299,
        Image: `${IMG}/photo-1461749280684-dccba630e2f6?w=1200&q=80`,
        Video: [
            { Video_Url: `${CDN}/big_buck_bunny.mp4`, Description: "01 - Routing, controllers and middleware" },
            { Video_Url: `${CDN}/dog.mp4?lesson=2`, Description: "02 - Modelling data and securing routes with JWT" },
        ],
    },
    {
        Course_Name: "Flutter for Beginners",
        Description:
            "One codebase, two app stores. Learn widgets, layouts, navigation and state management by building a real mobile app end to end.",
        Department: "Mobile Apps",
        Price: 999,
        Image: `${IMG}/photo-1526379095098-d400fd0bf935?w=1200&q=80`,
        Video: [
            { Video_Url: `${CDN}/elephants.mp4?lesson=1`, Description: "01 - Widgets and layout fundamentals" },
            { Video_Url: `${CDN}/sea_turtle.mp4?lesson=2`, Description: "02 - Navigation, state and publishing" },
        ],
    },
    {
        Course_Name: "Python Fundamentals",
        Description:
            "A gentle, hands-on introduction to Python: syntax, data structures, files and a first taste of automation scripting.",
        Department: "Programming Languages",
        Price: 799,
        Image: `${IMG}/photo-1555949963-aa79dcee981c?w=1200&q=80`,
        Video: [
            { Video_Url: `${CDN}/big_buck_bunny.mp4?lesson=1`, Description: "01 - Syntax, types and control flow" },
            { Video_Url: `${CDN}/dog.mp4?lesson=3`, Description: "02 - Functions, files and your first script" },
        ],
    },
];

function daysAgo(days) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
        console.error("MONGODB_URL is not set. Add it to .env before seeding.");
        process.exit(1);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const users = db.collection("users");
    const courses = db.collection("courses");

    // Wipe any previous demo run: the demo user and everything it owns.
    const existing = await users.findOne({ Username: DEMO_USERNAME });
    if (existing) {
        const owned = await courses.find({ Username: existing._id }, { projection: { _id: 1 } }).toArray();
        const ownedIds = owned.map((c) => c._id);

        if (ownedIds.length) {
            await courses.deleteMany({ _id: { $in: ownedIds } });
            // Detach the deleted courses from every other user's lists.
            await users.updateMany({}, {
                $pull: {
                    Favourite: { $in: ownedIds },
                    Cart: { $in: ownedIds },
                    Upload_Course: { $in: ownedIds },
                    Buy_Course: { courseId: { $in: ownedIds } },
                    Watched_Course: { courseId: { $in: ownedIds } },
                    Certificate: { courseId: { $in: ownedIds } },
                },
            });
        }

        await users.deleteOne({ _id: existing._id });
        console.log(`Removed the previous demo user and ${ownedIds.length} demo course(s).`);
    }

    const demoUserId = new ObjectId();
    const now = new Date();

    const courseDocs = demoCourses.map((course, i) => ({
        _id: new ObjectId(),
        ...course,
        Username: demoUserId,
        createdAt: daysAgo(40 - i * 7),
        updatedAt: daysAgo(40 - i * 7),
    }));

    await courses.insertMany(courseDocs);

    const [react, node, flutter, python] = courseDocs;

    await users.insertOne({
        _id: demoUserId,
        Username: DEMO_USERNAME,
        Password: await bcrypt.hash(DEMO_PASSWORD, 10),
        Email: DEMO_EMAIL,
        Full_name: DEMO_FULL_NAME,
        // Owns every seeded course, so the "uploaded courses" page has content.
        Upload_Course: courseDocs.map((c) => c._id),
        Favourite: [flutter._id, python._id],
        Cart: [python._id],
        Buy_Course: [
            { courseId: react._id, buyDate: daysAgo(21) },
            { courseId: node._id, buyDate: daysAgo(9) },
        ],
        Watched_Course: [
            // Finished - this is the course that has a certificate.
            {
                courseId: react._id,
                completedVideos: react.Video.map((v) => v.Video_Url),
                completedAt: daysAgo(5),
            },
            // Halfway through, so "continue learning" has something to show.
            {
                courseId: node._id,
                completedVideos: [node.Video[0].Video_Url],
                completedAt: null,
            },
        ],
        Certificate: [{ courseId: react._id, issuedAt: daysAgo(5) }],
        RazorpayId: "",
        createdAt: daysAgo(60),
        updatedAt: now,
    });

    console.log("Demo account seeded:");
    console.log(`  Username: ${DEMO_USERNAME}`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log(`  ${courseDocs.length} courses uploaded, 2 purchased, 1 completed with a certificate.`);

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error("Demo seed failed:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
