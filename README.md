# Project Manager

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
5. [Installation](#installation)
6. [Usage](#usage)
7. [API Endpoints](#api-endpoints)

## Introduction
Project Manager is a collaborative, lightweight project management application that
adapts to both individual and team workflows, based on the specific needs of users and teams.


## Features
- User authentication (registration and login)
- Create, update, delete projects and tasks
- Assign deadlines to tasks
- Arrange tasks in terms of priority
- Invite and manage collaborators for projects
- Add notes to tasks
- Responsive UI


## Technologies Used
- **Front-end**: React
- **Back-end**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: Passport.js
- **Styling**: Tailwind CSS

## Getting Started
Instructions to get a copy of the project up and running on your local machine for development and testing purposes:

### Prerequisites
- Node.js / npm
- MongoDB

### Installation
1. **Clone the repository**:
    ```sh
    git clone git@github.com:AaronChu333/CSE-115-.git
    cd task-manager
    ```

2. **Install dependencies for the backend**:
    ```sh
    cd server
    npm install
    ```

3. **Install dependencies for the frontend**:
    ```sh
    cd ../client
    npm install
    ```

### Configuration
1. **Backend**: Create a `.env` file in the `server` directory with unique key:
    ```
    MONGO= 'key'
    PORT=8080
    ```

### Usage
1. **Start the back-end server**:
    ```sh
    cd server
    npm run dev
    ```

2. **Start the front-end server**:
    ```sh
    cd client
    npm run dev
    ```

3. **Access the application**:
    Using the options presented in the terminal, access the local testing development in your browser.

## API Endpoints
### User Routes
- **POST /register**: Register a new user
- **POST /login**: Login a user
- **GET /logout**: Logout a user

### Project Routes
- **POST /projects**: Create a new project
- **GET /projects/:userId**: Get all projects for a user
- **PUT /projects/:projectId**: Rename a project
- **DELETE /projects/:projectId**: Delete a project
- **PUT /projects/:projectId/task-order**: Update task order within a project

### Task Routes
- **POST /tasks**: Create a new task
- **GET /tasks/:projectId**: Get all tasks for a project
- **PUT /tasks/:taskId**: Rename a task
- **PUT /tasks/:taskId/toggle**: Toggle task completion
- **PUT /tasks/:taskId/deadline**: Set task deadline
- **DELETE /tasks/:taskId**: Delete a task

### Note Routes
- **POST /tasks/:taskId/notes**: Add a note to a task
- **GET /tasks/:taskId/notes**: Get all notes for a task
- **DELETE /notes/:noteId**: Delete a note

### Invitation Routes
- **POST /invitations**: Send an invitation
- **POST /invitations/:invitationID/accept**: Accept an invitation
- **POST /invitations/:invitationID/decline**: Decline an invitation
- **GET /invitations/requests/:userId**: Get pending invitations for a user
