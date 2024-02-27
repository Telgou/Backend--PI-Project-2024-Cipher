import Activity from "../models/Activity.js";
/* CREATE */
export const createActivity = async (req, res) => {
    try {
      const { activityId, activityName, activityTime,activityDuration, numberOfParticipants } = req.body;
      const newActivity = new Activity({
        activityId,
        activityName,
        activityTime,
        activityDuration,
        numberOfParticipants,
      });
      await newActivity.save();
  
      const activity = await Activity.find();
      res.status(201).json(activity);
    } catch (err) {
      res.status(409).json({ message: err.message });
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

/* UPDATE */
export const updateActivity = async (req, res) => {
    const { id } = req.params;
    const { activityName, activityTime,activityDuration, numberOfParticipants } = req.body;

    try {
      const updatedActivity = await Activity.findByIdAndUpdate(
        id,
        { activityName, activityTime, activityDuration, numberOfParticipants },
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