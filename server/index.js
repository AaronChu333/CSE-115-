import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/User.js';
import bcryptjs from 'bcryptjs';
import passport from './config/passport.js';
import session from 'express-session';
import flash from 'connect-flash';
import Project from './models/project.js';
import Task from './models/task.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGO;

if (!MONGO) {
    console.error("MongoDB connection string (MONGO) is missing in environment variables");
    process.exit(1); // Exit the process with failure
}

mongoose.connect(MONGO)
    .then(() => {
        console.log('Connected to Mongo');
        app.listen(PORT, () => {
            console.log(`Server Running on PORT: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process with failure
    });

app.use(cors()); // Enable CORS
app.use(express.json());

// Session and Passport configuration
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body; 
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User({ username, email, password: hashedPassword }); 
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error registering user' });
        next(err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ email: identifier });
        
        if (!user || !bcryptjs.compareSync(password, user.password)) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        res.send({ userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error logging in' });
    }
});

// Create a project
app.post('/projects', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const newProject = new Project({ userId, name });
        await newProject.save();
        res.status(201).send(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error creating project' });
    }
});

// Get projects for a user
app.get('/projects/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project.find({ userId });
        res.status(200).send(projects);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error fetching projects' });
    }
});

// Create a task
app.post('/tasks', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const task = new Task({ userId, name });
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error creating task' });
    }
});

// Get tasks for a user
app.get('/tasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await Task.find({ userId });
        res.status(200).send(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error fetching tasks' });
    }
});

// Add a note to a task
app.post('/tasks/:taskId/notes', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { note } = req.body;
        const task = await Task.findById(taskId);
        task.notes.push(note);
        await task.save();
        res.status(200).send(task);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error adding note to task' });
    }
});

// Authentication routes
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
}));

app.get('/login', (req, res) => {
    res.send('Login Page');
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// Add a note to a project
app.post('/projects/:projectId/notes', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { note } = req.body;
        const project = await Project.findById(projectId);
        project.notes.push(note);
        await project.save();
        res.status(200).send(project);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error adding note to project' });
    }
});

// Rename a project
app.put('/projects/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, newName } = req.body;

        const project = await Project.findOneAndUpdate(
            { _id: projectId, userId },
            { name: newName },
            { new: true }
        );

        if (!project) {
            return res.status(404).send({ error: 'Project not found or you do not have permission to rename this project' });
        }

        res.status(200).send(project);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error renaming project' });
    }
});

// Rename a task
app.put('/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { userId, newName } = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { name: newName },
            { new: true }
        );

        if (!task) {
            return res.status(404).send({ error: 'Task not found or you do not have permission to rename this task' });
        }

        res.status(200).send(task);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error renaming task' });
    }
});

// Delete a project
app.delete('/projects/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).send({ error: 'Project not found' });
        }
        res.status(200).send({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error deleting project' });
    }
});

// Delete a task
app.delete('/tasks/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).send({ error: 'Task not found' });
        }
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error deleting task' });
    }
});

export default app;

