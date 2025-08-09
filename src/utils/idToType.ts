import { Model } from "mongoose";

export default function idToType(
  id: string,
  model: Model<{ _id: string; type: string }>
): Promise<string> {
  return model
    .findOne({ _id: id })
    .lean()
    .then((doc) => doc!.type);
}
