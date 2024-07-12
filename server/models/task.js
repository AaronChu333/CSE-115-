import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    notes: [{ type: String }] 
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
