import Activity from "../models/Activity.js";
/* UPDATE */
export const updateActivity = async (req, res) => {
  const { id } = req.params;
  const { activityName, activityTime, numberOfParticipants,startingLocation,destination,availableSeats,driverName,driverContact,courseName ,instructorName,courseDuration,locationOrPlatform,  meetingTitle,hostName,meetingDuration,meetingLink,meetingAgenda ,  sportActivityName, location,equipmentRequirements} = req.body;

  try {
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { activityName, activityTime, numberOfParticipants,startingLocation,destination,availableSeats,driverName,driverContact,courseName ,instructorName,courseDuration,locationOrPlatform,  meetingTitle,hostName,meetingDuration,meetingLink,meetingAgenda ,  sportActivityName, location,equipmentRequirements},
      { new: true } // Return the modified document
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activities = await Activity.find();
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* activity rating */
export const addActivityFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body; // Extract comment from request body

  try {
    // Find the activity by ID
    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Create a new feedback object
    const newFeedback = {
      rating: rating,
     // comment: comment, // Include the comment
      createdAt: Date.now()
    };

    // Add the new feedback to the activity's feedback array
    activity.feedback.push(newFeedback);

    // Save the updated activity document
    await activity.save();

    // Return the updated activity with the new feedback
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add feedback', error: error.message });
  }
};

/* UPDATING ONLY NUMBER OF PARTICIPANTS */
export const incrementParticipants = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { $inc: { numberOfParticipants: 1 } }, 
      { new: true }
    );

    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.status(200).json(updatedActivity); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* CREATE */
export const createActivity = async (req, res) => {
    try {   

      const { activityName, activityTime, numberOfParticipants,startingLocation,destination,availableSeats,driverName,driverContact,courseName ,instructorName,courseDuration,locationOrPlatform,  meetingTitle,hostName,meetingDuration,meetingLink,meetingAgenda ,  sportActivityName, location,equipmentRequirements,covoiturage,course,onlineMeeting,sportActivity} = req.body;
      
      const newActivity = new Activity({
        
        activityName,
        activityTime,
        numberOfParticipants,
        startingLocation,
        destination,
        availableSeats,
        driverName,
        driverContact,
        courseName,
        instructorName,
        courseDuration,
        locationOrPlatform,
        meetingTitle,
        hostName,
        meetingDuration,
        meetingLink,
        meetingAgenda,
        sportActivityName, 
        location,
        equipmentRequirements,
        covoiturage,course,onlineMeeting,sportActivity
      });
      console.log('hello', newActivity);
      await newActivity.save();
  
      const activity = await Activity.find();
      res.status(201).json(activity);
    } catch (err) {
      // res.status(409).json({ message: err.message });
      console.log(err);
    }
  };
//READ
  export const getActivities = async (req, res) => {
    try {
      const activity = await Activity.find();
      res.status(200).json(activity);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };

  /* DELETE */
export const deleteActivity = async (req, res) => {
    const { id } = req.params;

    try {
      const deletedActivity = await Activity.findByIdAndRemove(id);

      if (!deletedActivity) {
        return res.status(404).json({ message: 'Activity not found' });
      }

      const activities = await Activity.find();
      res.status(200).json(activities);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

