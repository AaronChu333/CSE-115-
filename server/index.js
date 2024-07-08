import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/user.js';
import bcryptjs from 'bcryptjs';
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

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body; // Include username
        const hashed = bcryptjs.hashSync(password, 10);
        const newUser = new User({ username, email, password: hashed }); // Include username
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
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
