import mongoose from "mongoose";

const PreUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      /*validate: {
        validator: function (value) {
          return value.endsWith("@esprit.tn");
        },
        message: props => `${props.value} is not a valid email, it must end with "@esprit.tn"`,
      },*/
    },
    token: {
      type: String,
    },
    valid: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const PreUser = mongoose.model("PreUser", PreUserSchema);
export default PreUser;
