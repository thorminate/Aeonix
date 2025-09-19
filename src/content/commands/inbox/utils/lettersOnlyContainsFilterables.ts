import Letter from "../../../../models/player/utils/inbox/letter.js";

export default function lettersOnlyContainsFilterables(letters: Letter[]) {
  if (letters.length === 0) return false;
  return letters.every(
    (letter) => letter.isArchived === true || letter.isNotification === true
  );
}
