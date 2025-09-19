import Letter from "../inbox/letter.js";

type Notification = Letter & { isNotification: true };

export default Notification;
