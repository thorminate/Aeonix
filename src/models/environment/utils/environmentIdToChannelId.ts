import fetchAllEnvironments from "./fetchAllEnvironments.js";

export default async (environmentId: string): Promise<string> => {
  const allEnvironments = await fetchAllEnvironments();
  return (
    allEnvironments.find((env) => env.id === environmentId)?.channelId ?? ""
  );
};
