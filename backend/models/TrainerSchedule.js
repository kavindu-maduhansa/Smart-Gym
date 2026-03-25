import mongoose from 'mongoose';

const trainerScheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  attendanceStatus: { type: String, enum: ['Pending', 'Attended', 'Absent'], default: 'Pending' }
}, { timestamps: true });

// THIS IS THE ES MODULE EXPORT
const TrainerSchedule = mongoose.model('TrainerSchedule', trainerScheduleSchema);
export default TrainerSchedule;