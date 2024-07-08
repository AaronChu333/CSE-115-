import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
