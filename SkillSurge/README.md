# 🚀 SkillSurge - Online Learning Platform

SkillSurge is a modern E-Learning Platform built with Next.js, TypeScript, MongoDB, Prisma, and Tailwind CSS. The platform enables instructors to create and manage courses while allowing students to purchase courses, track learning progress, and earn certificates upon completion.

---

## 📌 Features

### 👨‍🎓 Student Features

* User Registration & Login
* JWT Authentication
* Browse Available Courses
* Purchase Courses
* Watch Course Videos
* Track Learning Progress
* Add Courses to Favorites
* Download Course Certificates
* Responsive User Dashboard
* Secure Access to Purchased Courses

### 👨‍🏫 Instructor Features

* Create New Courses
* Upload Course Thumbnails
* Upload Course Videos
* Update Course Information
* Delete Courses
* Manage Course Content
* View Published Courses

### 🔒 Authentication & Security

* JWT Based Authentication
* Protected Routes
* Role-Based Authorization
* Secure API Endpoints
* Password Encryption

### 📊 Progress Tracking

* Track Completed Videos
* Calculate Course Completion Percentage
* Save Progress Per User
* Resume Learning Anytime

### 🏆 Certificate Generation

* Generate Certificates
* Prevent Duplicate Certificates
* Verify Course Completion Before Issuing Certificate

---

## 🛠️ Tech Stack

### Frontend

* Next.js 15
* React.js
* TypeScript
* Tailwind CSS
* ShadCN UI
* Axios

### Backend

* Next.js API Routes
* Node.js
* Prisma ORM

### Database

* MongoDB

### Cloud Storage

* Cloudinary

### Authentication

* JWT (JSON Web Token)

---

## 📂 Project Structure

```bash
SkillSurge/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── courses/
│   ├── login/
│   └── register/
│
├── components/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── cloudinary.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── types/
│
├── middleware.ts
│
└── package.json
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/skillsurge.git
```

### 2. Navigate to Project

```bash
cd skillsurge
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run Database Migration

```bash
npx prisma db push
```

### 7. Start Development Server

```bash
npm run dev
```

---

## 🚀 API Modules

### Authentication

```http
POST /api/register
POST /api/login
```

### Course Management

```http
POST   /api/course
GET    /api/course
PUT    /api/course
DELETE /api/course
```

### Course Purchase

```http
PUT /api/course/buy
```

### Video Progress

```http
PUT /api/course/video
```

### Certificates

```http
POST /api/certificate
```

---

## 📸 Main Modules

### Home Page

* Featured Courses
* Course Categories
* Modern Landing Page

### Dashboard

* Purchased Courses
* Favorite Courses
* Progress Overview

### Course Details

* Course Information
* Video Lessons
* Purchase Option

### Learning Section

* Watch Videos
* Track Progress
* Continue Learning

### Certificate Section

* Generate Certificate
* Download Certificate

---

## 🗄️ Database Models

### User

```typescript
User {
  id
  name
  email
  password
  purchasedCourses
  favoriteCourses
}
```

### Course

```typescript
Course {
  id
  title
  description
  price
  thumbnail
  videos
  instructor
}
```

### Progress

```typescript
Progress {
  id
  userId
  courseId
  completedVideos
}
```

### Certificate

```typescript
Certificate {
  id
  userId
  courseId
  issuedAt
}
```

---

## 💡 Future Enhancements

* Razorpay Integration
* Instructor Dashboard Analytics
* Course Reviews & Ratings
* Live Classes
* Discussion Forum
* Email Notifications
* Admin Panel
* AI-Powered Course Recommendations
* Multi-Language Support

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Kushal Vaghela**

Full Stack Developer

### Skills

* Next.js
* React.js
* TypeScript
* Node.js
* MongoDB
* Prisma
* Tailwind CSS
* Java
* Spring Boot

---

⭐ If you like this project, don't forget to star the repository!
