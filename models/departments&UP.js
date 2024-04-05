import mongoose from "mongoose";

// Department Schema
const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    depHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
const Department = mongoose.model('Department', DepartmentSchema);

/*
const initialDepartments = ['Informatique', 'Business', 'Mecanique', 'Mathematics'];

initialDepartments.forEach(async (name) => {
  try {
    await new Department({ name }).save();
  } catch (error) {
    console.error("Error creating department:", error);
  }
}); 
*/

// Pedagogical Unit Schema (UP)
const PedagogicalUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
const PedagogicalUnit = mongoose.model('PedagogicalUnit', PedagogicalUnitSchema);
/*
const initialUPs = ['Python', 'Java', 'React', 'Angular'];

initialUPs.forEach(async (name) => {
  try {
    await new PedagogicalUnit({ name }).save();
  } catch (error) {
    console.error("Error creating UP:", error);
  }
}); 

*/
export { Department, PedagogicalUnit }; 
