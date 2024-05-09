import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120
    },
});

// hook to delete the old reset token before saving a new one
resetTokenSchema.pre('save', async function (next) {
    try {
        await ResetToken.deleteMany({ userId: this.userId });
        next();
    } catch (error) {
        next(error);
    }
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);
export default ResetToken;
