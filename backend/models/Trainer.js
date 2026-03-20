import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // This matches the model name in User.js
        required: true,
        unique: true 
    },
    phone: String,
    bio: String,
    specializations: [String],
    experienceYears: Number,
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'on_leave'], 
        default: 'active' 
    },
    availability: [{
        dayOfWeek: { type: Number, min: 0, max: 6 }, 
        startTime: String, 
        endTime: String
    }],
    metrics: {
        avgRating: { type: Number, default: 0 },
        attendanceRate: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model("Trainer", trainerSchema);