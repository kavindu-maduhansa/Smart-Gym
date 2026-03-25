import mongoose from "mongoose";

const trainerNoteSchema = new mongoose.Schema({
    trainer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    note: { 
        type: String, 
        default: "" 
    },
    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one note per trainer-student pair
trainerNoteSchema.index({ trainer: 1, student: 1 }, { unique: true });

const TrainerNote = mongoose.model("TrainerNote", trainerNoteSchema);
export default TrainerNote;
