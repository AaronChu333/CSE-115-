import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

export default Note;