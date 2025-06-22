export default class Letter {
  sender: string;
  recipient: string;
  subject: string;
  body: string;

  constructor(
    sender: string,
    recipient: string,
    subject: string,
    body: string
  ) {
    this.sender = sender;
    this.recipient = recipient;
    this.subject = subject;
    this.body = body;
  }
}
