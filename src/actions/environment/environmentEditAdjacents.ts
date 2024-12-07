import { ModalSubmitInteraction } from "discord.js";
import EnvironmentData from "../../models/EnvironmentData";

interface Options {
  name: string;
  operator: "add" | "remove" | "set";
  adjacents: string[];
}

export default async (options: Options) => {
  const { name, operator, adjacents } = options;

  const environment = await EnvironmentData.findOne({
    name,
  });

  if (!environment) {
    throw new Error("Environment not found!");
  }
  const adjacentEnvironments = await Promise.all(
    adjacents.map(async (name) => {
      const adjacentEnvironment = await EnvironmentData.findOne({
        name,
      });

      return adjacentEnvironment;
    })
  );

  const invalidEnvironments = adjacentEnvironments.filter(
    (adjacentEnvironment) => !adjacentEnvironment
  );
  if (invalidEnvironments.length > 0) {
    throw new Error(
      `Environment(s) ${invalidEnvironments
        .map((environment) => environment.name)
        .join(", ")} not found!`,
      {
        cause: invalidEnvironments,
      }
    );
  }

  switch (operator) {
    case "add":
      environment.adjacents.push(...adjacents);
      await environment.save();
      break;
    case "remove":
      environment.adjacents = environment.adjacents.filter(
        (adjacent) => !adjacents.includes(adjacent)
      );
      await environment.save();
      break;
    case "set":
      environment.adjacents = adjacents;
      await environment.save();
      break;
  }
};
