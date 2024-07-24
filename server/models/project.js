import mongoose,{Schema} from 'mongoose';

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    task: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Task',
        }
    ],
    collaborators: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    taskOrder: [{ type: Schema.Types.ObjectId, ref: 'Task' }]

});

const Project = mongoose.model('Project', projectSchema);
export default Project;
