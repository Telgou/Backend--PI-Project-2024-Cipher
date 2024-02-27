import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    activityName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    activityTime: {
      type: Date,
      required: true,
    },
    activityDuration: {
      type: Number,
      required: true,
      max: 50,
      unique: true,
    },
    numberOfParticipants: {
      type: Number,
      required: true,
      min: 5,
    }
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", ActivitySchema);
export default Activity;
