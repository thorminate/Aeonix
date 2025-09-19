import Letter from "../../../../models/player/utils/inbox/letter.js";

export default function lettersOnlyContainsNotifications(letters: Letter[]) {
  if (letters.length === 0) return false;
  return letters.every(
    (letter) => letter.isNotification === true || letter.isArchived === false
  );
}
