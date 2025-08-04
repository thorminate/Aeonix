import Letter from "../../../../models/player/utils/inbox/letter.js";

export default function findLetterFromIdStrict(
  letters: Letter[],
  id: string
): [Letter, number] {
  const resultIndex = letters.findIndex((letter) => letter.id === id);

  const result = letters?.[resultIndex];

  if (!result) {
    throw new Error("Could not find letter from id", {
      cause: {
        id,
        letters,
      },
    });
  }

  return [result, resultIndex];
}
