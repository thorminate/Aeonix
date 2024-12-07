// Model for environment database
import { Schema, model } from "mongoose"; // Import the mongoose library.

const environmentData = new Schema({
  // Define the schema.
  name: {
    // Define the environment name.
    type: String,
    required: true,
  },
  channel: {
    // Define the environment channel.
    type: String,
    required: true,
  },
  items: {
    // Define the environment items.
    type: Array<object>,
    default: [],
  },
  users: {
    // Define the environment users.
    type: Array<string>,
    default: [],
  },
  adjacents: {
    // Define the environments adjacent environments.
    type: Array<string>,
    default: [],
  },
});

export default model("environment", environmentData); // Export the model.
