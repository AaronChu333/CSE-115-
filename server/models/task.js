import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true },
    notes: [{ type: String }],
    completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
