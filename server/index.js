import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import User from './models/user.js'; 
import bcryptjs from 'bcryptjs';


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
        const { email, password } = req.body;
        const hashed = bcryptjs.hashSync(password, 10);
        const newUser = new User({ email, password: hashed });
        await newUser.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error registering user' });
        next(error);
    }
});
