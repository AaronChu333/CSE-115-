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
import Invitation from './models/Invitations.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGO;

// enabling cors
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions))

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

//Registering
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


//Logging in
app.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({
            $or: [
              { email: identifier },
              { username: identifier }
            ]
          });
          
        
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
  
      // Create a new project
      const newProject = new Project({ userId, name });
      await newProject.save();
  
      // Add the new project's ID to the user's projects array
      await User.findByIdAndUpdate(
        userId,
        { $push: { projects: newProject._id } },
        { new: true, useFindAndModify: false }
      );
  
      res.status(201).send(newProject);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error creating project' });
    }
  });

// Fetch projects
app.get('/projects/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).populate('projects');
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.status(200).send(user.projects);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: 'Error fetching projects' });
    }
  });

// Create a task
app.post('/tasks', async (req, res) => {
    try {
      const { userId, projectId, name } = req.body;
      console.log('Received task creation request:', { userId, projectId, name }); // Debugging line
  
      // Check for missing required fields
      if (!userId || !projectId || !name) {
        return res.status(400).send({ error: 'Missing required fields' });
      }
  
      // Create a new task
      const task = new Task({ userId, projectId, name });
      await task.save();
  
      // Add the new task's ID to the project's tasks array
      await Project.findByIdAndUpdate(
        projectId,
        { $push: { task: task._id } },
        { new: true, useFindAndModify: false }
      );
  
      console.log('Task created:', task); // Debugging line
      res.status(201).send(task);
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).send({ error: 'Error creating task', details: err.message });
    }
  });

// Get tasksId for a project
app.get('/tasks/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ projectId });
        if (!tasks) {
            return res.status(404).send({ error: 'No tasks found for this project' });
        }
        res.status(200).send(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error fetching tasks' });
    }
});

// Get tasks from id
  app.get('/tasks/id/:tasksId', async (req, res) => {
    try {
        const{ taskId } = req.params;
        const task = await Task.findOne({ taskId });
        res.status(200).send(task);  
    } catch (error) {
        console.error(err);
        res.status(500).send({ error: 'Error finding task' });
    }
  })

  // Get tasks notes
  app.get('/tasks/notes/:tasksId', async (req, res) => {
    try {
        const{ taskId } = req.params;
        const task = await Task.findOne({ taskId });
        res.status(200).send(task);
    } catch (error) {
        console.error(err);
        res.status(500).send({ error: 'Error finding task' });
    }
  })

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

// Toggle task completion
app.put('/tasks/:taskId/toggle', async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await Task.findById(taskId);
      
      if (!task) {
        return res.status(404).send({ error: 'Task not found' });
      }
      
      task.completed = !task.completed;
      await task.save();
      
      res.status(200).send(task);
    } catch (err) {
      console.error('Error toggling task completion:', err);
      res.status(500).send({ error: 'Error toggling task completion' });
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

// Update project order
app.put('/users/:userId/project-order', async (req, res) => {
    try {
      const { userId } = req.params;
      const { projectOrder } = req.body;
      
      await User.findByIdAndUpdate(userId, { projectOrder });
      
      res.status(200).send({ message: 'Project order updated successfully' });
    } catch (error) {
      console.error('Error updating project order:', error);
      res.status(500).send({ error: 'Error updating project order' });
    }
});

// Update task order
app.put('/projects/:projectId/task-order', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { taskOrder } = req.body;
      
      await Project.findByIdAndUpdate(projectId, { taskOrder });
      
      res.status(200).send({ message: 'Task order updated successfully' });
    } catch (error) {
      console.error('Error updating task order:', error);
      res.status(500).send({ error: 'Error updating task order' });
    }
});

export default app;
