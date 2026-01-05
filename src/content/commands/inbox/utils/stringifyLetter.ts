import Letter from "#player/utils/inbox/letter.js";

export default function stringifyLetter(letter: Letter) {
  return `${letter.sender} ${letter.subject} ${letter.body}`;
}
