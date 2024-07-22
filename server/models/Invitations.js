import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
