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

});

const Project = mongoose.model('Project', projectSchema);
export default Project;
