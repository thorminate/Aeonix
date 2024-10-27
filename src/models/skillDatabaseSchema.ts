// Model for skill database
import { Schema, model } from "mongoose"; // Import the mongoose library.

const skillData = new Schema({
  // Define the schema.
  name: {
    // Define the skill name.
    type: String,
    required: true,
  },
  description: {
    // Define the skill description.
    type: String,
    required: true,
  },
  action: {
    // Define the skill action.
    type: String,
    required: true,
  },
  cooldown: {
    // Define the skill cooldown.
    type: Number,
    required: true,
  },
  will: {
    // Define the skill will.
    type: Number,
    required: true,
  },
  users: {
    // Define the skill users.
    type: Array<string>,
    default: [],
  },
});

export default model("skill", skillData); // Export the model.
