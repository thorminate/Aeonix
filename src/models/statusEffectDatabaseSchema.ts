// Model for status effect database
import { Schema, model } from "mongoose"; // Import the mongoose library.

const statusEffectData = new Schema({
  // Define the schema.
  name: {
    // Define the status effect name.
    type: String,
    required: true,
  },
  duration: {
    // Define the status effect duration.
    type: Number,
    required: true,
  },
  description: {
    // Define the status effect description.
    type: String,
    required: true,
  },
  users: {
    // Define the status effect users.
    type: Array<string>,
    default: [],
  },
});

export default model("statusEffect", statusEffectData); // Export the model.
