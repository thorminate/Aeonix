import Letter from "../../../../models/player/utils/inbox/letter.js";

export default function stringifyLetter(letter: Letter) {
  return `${letter.sender} ${letter.subject}`;
}
