# ClientPulse – Business Enquiry & Client Request Management System

ClientPulse is a modern CRM-style Business Enquiry Management System designed to help organizations manage client enquiries, track client requirements, monitor follow-ups, and visualize the sales pipeline from a centralized dashboard. The application provides complete enquiry management with Create, Read, Update, and Delete operations along with dashboard analytics, advanced search and filtering, follow-up tracking, pipeline visualization, conversion rate analysis, revenue analytics, and CSV export functionality.

## Features

ClientPulse provides a professional dashboard that displays Total Enquiries, Pipeline Value, Follow-ups, Won Enquiries, Conversion Rate, and enquiry pipeline analytics. The dashboard also includes an animated enquiry flow graph that visually represents the progression of enquiries through different stages such as New, Contacted, Qualified, Proposal Sent, Negotiation, Won, and Lost.

The Enquiry Management module allows users to create, view, edit, and delete client enquiries. Each enquiry contains Client / Company Name, Contact Person, Email, Phone, Enquiry Source, Service Requirement, Requirement Description, Estimated Budget, Status, Assigned Person, Next Follow-up Date, and Additional Notes.

The system supports advanced search and filtering options. Users can search enquiries by company or contact and filter records based on Status, Enquiry Source, Assigned Person, Follow-up Status, Minimum Budget, and Maximum Budget.

The Follow-up Management feature helps users identify Overdue Follow-ups, Today's Follow-ups, and Upcoming Follow-ups, making it easier to track pending client communication and sales activities.

The Revenue and Pipeline Analytics feature calculates the overall pipeline value, won value, active pipeline value, and conversion rate based on the enquiry data. The conversion rate is calculated using the number of won enquiries compared with the total number of enquiries.

ClientPulse also provides an animated visual pipeline graph that displays enquiry distribution across different stages. The graph includes animated line drawing, data points, stage labels, and stage-wise enquiry counts to provide a clear visual representation of the sales pipeline.

The CSV Export feature allows users to export enquiry information into a CSV file. Filtered enquiry results can also be exported for reporting and offline analysis.

The application follows a modern CRM-style user interface with responsive layouts, professional cards, tables, status badges, rounded components, subtle shadows, hover effects, animations, and responsive design for different screen sizes.

## Technology Stack

Frontend: React.js, JavaScript, CSS, Axios, Vite

Backend: Java, Spring Boot, Spring Data JPA, REST API, Maven

Database: MySQL

API Testing: Postman

Version Control: Git and GitHub

## System Architecture

The application follows a three-layer architecture consisting of the React frontend, Spring Boot backend, and MySQL database.

User interacts with the React.js frontend. The frontend communicates with the Spring Boot backend using REST APIs through Axios. The Spring Boot application processes requests using the Controller, Service, and Repository layers. Spring Data JPA is used to communicate with the MySQL database. The backend sends the processed data back to the React frontend, where the dashboard and enquiry management interface are updated dynamically.

## Enquiry Fields

Each enquiry contains the following fields:

Client / Company Name  
Contact Person  
Email  
Phone  
Enquiry Source  
Service Requirement  
Requirement Description  
Estimated Budget  
Status  
Assigned Person  
Next Follow-up Date  
Additional Notes

## Enquiry Status

The application supports the following enquiry stages:

New  
Contacted  
Qualified  
Proposal Sent  
Negotiation  
Won  
Lost

The main sales pipeline follows the progression:

New → Contacted → Qualified → Proposal Sent → Negotiation → Won

Lost enquiries are maintained separately.

## REST API

The backend REST API uses the following base URL:

http://localhost:8080/api/enquiries

Get all enquiries:

GET /api/enquiries

Get enquiry by ID:

GET /api/enquiries/{id}

Create a new enquiry:

POST /api/enquiries

Update an existing enquiry:

PUT /api/enquiries/{id}

Delete an enquiry:

DELETE /api/enquiries/{id}

The frontend automatically loads enquiry data when the application starts. After creating, updating, or deleting an enquiry, the enquiry list and dashboard metrics are refreshed.

## Database

The project uses MySQL as the relational database.

Database name:

clientpulse

The application stores client enquiry information and retrieves the data through Spring Data JPA.

## How to Run the Project

First, clone the GitHub repository using:

git clone <YOUR_GITHUB_REPOSITORY_URL>

Navigate to the project directory:

cd ClientPulse

For backend setup, navigate to the backend directory:

cd backend

Configure the MySQL database connection in the application.properties file.

Create the MySQL database using:

CREATE DATABASE clientpulse;

Start the Spring Boot backend using:

mvn spring-boot:run

The backend will run at:

http://localhost:8080

For frontend setup, navigate to the frontend directory:

cd frontend

Install the required dependencies:

npm install

Start the React development server:

npm run dev

The frontend will run at:

http://localhost:5173

## API Testing

The REST APIs can be tested using Postman. The available operations include creating enquiries, retrieving all enquiries, retrieving an enquiry by ID, updating enquiries, and deleting enquiries.

## Dashboard Analytics

The dashboard automatically calculates metrics from the enquiry data received from the backend. It provides total enquiry count, status-wise enquiry count, pipeline value, won value, active pipeline value, conversion rate, follow-up statistics, and enquiry progression.

## Data Flow

User → React.js Frontend → Axios REST API Request → Spring Boot Controller → Service Layer → JPA Repository → MySQL Database → Backend Response → React Dashboard

## Responsive Design

The application is designed with responsive layouts so that the interface can adapt to desktop, laptop, tablet, and mobile screen sizes.

## Project Objective

The main objective of ClientPulse is to provide a centralized platform for managing business enquiries and client requests while reducing manual tracking and improving visibility into the sales pipeline. The application combines enquiry management, client requirement tracking, follow-up management, analytics, pipeline visualization, advanced filtering, and reporting into a single CRM-style system.

## Future Enhancements

Future versions of ClientPulse can include user authentication, role-based access control, email notifications, automated follow-up reminders, PDF report generation, advanced sales forecasting, activity history, audit logs, cloud deployment, and real-time notifications.

## Project Summary

ClientPulse is a full-stack business enquiry management application built using React.js, Java Spring Boot, MySQL, REST APIs, and Axios. It demonstrates frontend development, backend API development, database integration, CRUD operations, data visualization, analytics, filtering, reporting, and responsive UI development in a single real-world business application.

Built with React.js, Spring Boot, MySQL, REST API, Java, and modern web technologies.