// Model for item database
import { Schema, model } from "mongoose"; // Import the mongoose library.

const itemData = new Schema({
  // Define the schema.
  name: {
    // Define the item name.
    type: String,
    required: true,
  },
  description: {
    // Define the item description.
    type: String,
    required: true,
  },
  actionType: {
    // Define the item actionable.
    type: String,
    required: true,
  },
  users: {
    // Define the item users.
    type: Array<string>,
    default: [],
  },
  environments: {
    // Define the item environments.
    type: Array<string>,
    default: [],
  },
});

export default model("item", itemData); // Export the model.
