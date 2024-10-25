import { Document } from "mongodb";
import log from "../../utils/log";

function getRandomFromRange(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Levels up the user and returns the new level.
 * @param {Document} user
 * @param {number} levelAmount The amount of levels to level up, defaults to 1.
 * @returns {Promise<Document>}
 */
export default async (
  user: Document,
  levelAmount: number = 1
): Promise<Document> => {
  try {
    if (levelAmount < 1) {
      return user;
    }
    const strengthMultiplied = Math.imul(
      user.multipliers.strength,
      getRandomFromRange(1, 15)
    );
    const willMultiplied = Math.imul(
      user.multipliers.will,
      getRandomFromRange(1, 15)
    );
    const cognitionMultiplied = Math.imul(
      user.multipliers.cognition,
      getRandomFromRange(1, 15)
    );

    for (let i = 0; i < levelAmount; i++) {
      user.exp = 0;
      user.level++;
      user.strength += strengthMultiplied;
      user.will += willMultiplied;
      user.cognition += cognitionMultiplied;
    }

    // then round the values
    user.strength = Math.round(user.strength);
    user.will = Math.round(user.will);
    user.cognition = Math.round(user.cognition);

    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    log({
      header: "Level Up Error",
      payload: `${error}`,
      type: "error",
    });
  }
};
