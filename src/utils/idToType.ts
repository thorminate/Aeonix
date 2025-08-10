import { Model } from "mongoose";

export default function idToType(
  id: string,
  model: Model<{ _id: string; type: string }>
): Promise<string> {
  return model
    .findOne({ _id: id })
    .lean()
    .then((doc) => {
      const type = doc?.type;
      if (!type) throw new Error("No type found for id: " + id);
      return type;
    });
}
