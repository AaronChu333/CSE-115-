import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/User.js';
import bcryptjs from 'bcryptjs';
import passport from './config/passport.js';
import session from 'express-session';
import flash from 'connect-flash';

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
        next(error);
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
