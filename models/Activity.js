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

    numberOfParticipants: {
      type: Number,
      required: true,
      min: 5,
    },
    startingLocation:{
      type:String,
      min:2, 
      max:100
    },
    destination:{
      type:String,
      min:2,
      max:100,
    },
    availableSeats:{
      type:Number,
      
    },
    driverName:{
      type:String,
      min:2,
      max:20
    },
   
  
   
   
   
    driverContact:{
      type:Number,
    
    },
    courseName:{
      type:String,
      max:8,
      min:2
    },
    instructorName:{
      type:String,
      max:10,
      min:2
    },
    courseDuration:{
      type:Date,
    },
    locationOrPlatform:{
      type:String,
      max:100
    },
    meetingTitle:{
      type:String,
      max:100
    },
    hostName:{
      type:String,
      max:10,
      min:2
    },
    meetingDuration:{
      type:Number,
      max:5,
    },
    meetingLink:{
      type:String,
    },
    meetingAgenda:{
      type:String
    },
    sportActivityName:{
      type:String,
      max:20,
    }, 
    location:{
      type: String,

    },
    equipmentRequirements:{
      type:String
    },
    covoiturage: {
      type: Boolean,
      default: false,
    },
    course: {
      type: Boolean,
      default: false,
    },
    onlineMeeting: {
      type: Boolean,
      default: false,
    },
    sportActivity: {
      type: Boolean,
      default: false,
    },
    feedback: [
      {
       // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  hedhy netsawar test7a9ha ki chetzid user 
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now }
      },
    ]
    
  },
  
  { timestamps: true }
);

const Activity = mongoose.model("Activity", ActivitySchema);
export default Activity;
