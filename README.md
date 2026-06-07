# Learning Management System (LMS)

A full-stack Learning Management System (LMS) built using **Java, Spring Boot, React, and MySQL**. The platform enables students to access courses, watch video lectures, complete assignments and quizzes, while instructors can manage educational content and track learner progress.

## 🚀 Features

### Authentication & Authorization

* Secure JWT-based authentication
* Role-based access control (Admin, Instructor, Student)
* Login and Registration
* Protected routes and APIs

### Course Management

* Create, update, and delete courses
* Course categorization
* Course enrollment system
* Course details and descriptions

### Video Lectures

* Upload and manage lecture videos
* Stream video content
* Track lecture completion status

### Quiz Management

* Create quizzes with multiple-choice questions
* Automatic score calculation
* Quiz result tracking

### Assignment Management

* Create and manage assignments
* Assignment submission system
* Evaluation workflow

### Progress Tracking

* Monitor course completion percentage
* Track completed lectures
* View quiz and assignment performance

### Dashboard

* Student Dashboard
* Instructor Dashboard
* Admin Dashboard
* Course analytics and statistics

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Redux Toolkit
* Tailwind CSS

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT Authentication
* Maven

### Database

* MySQL

## 📂 Project Structure

```text
LMS
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── services
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   └── security
│
└── database
```

## ⚙️ Installation

### Prerequisites

* Java 17+
* Maven
* Node.js
* MySQL

### Clone Repository

```bash
git clone https://github.com/nist-kishan/Learning-Management-System-LMS-.git
cd Learning-Management-System-LMS-
```

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

1. Create a MySQL database.
2. Update database credentials in:

```properties
application.properties
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lms
spring.datasource.username=root
spring.datasource.password=your_password
```

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Courses

```http
GET    /api/courses
GET    /api/courses/{id}
POST   /api/courses
PUT    /api/courses/{id}
DELETE /api/courses/{id}
```

### Enrollment

```http
POST /api/enrollments
GET  /api/enrollments/student/{id}
```

### Quizzes

```http
POST /api/quizzes
GET  /api/quizzes/{id}
POST /api/quizzes/submit
```

## Future Enhancements

* Payment Integration
* Live Classes
* Discussion Forum
* Certificate Generation
* Notifications
* Mobile Application

## Screenshots

Add project screenshots here.

```text
screenshots/
├── login.png
├── dashboard.png
├── course-list.png
├── quiz.png
└── profile.png
```

## Author

**Kishan Raj**

* GitHub: https://github.com/nist-kishan
* LinkedIn: https://linkedin.com/in/kishanrajrby2
* Portfolio: https://portfolio-kishanrajrby2.onrender.com

## License

This project is licensed under the MIT License.
