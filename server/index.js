import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGO;

mongoose.connect(MONGO)
    .then(() => console.log('Connected to Mongo'))
    .catch ((err) => console.log(err))
    
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server Running on PORT: ${PORT}`);
});