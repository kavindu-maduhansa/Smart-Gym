const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const mealPlanSchema = new mongoose.Schema({
    trainerId: mongoose.Schema.Types.ObjectId,
    title: String,
    isTemplate: Boolean
}, { strict: false });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const plans = await MealPlan.find({});
        console.log('--- MEAL PLANS IN DB ---');
        console.log(JSON.stringify(plans, null, 2));
        console.log('--- END ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
