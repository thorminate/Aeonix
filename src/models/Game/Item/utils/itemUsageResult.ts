export default class ItemUsageResult {
  message: string;
  success: boolean;
  oneTime: boolean = false;
  data: any;

  constructor(message: string, success: boolean, depleted?: boolean) {
    this.message = message;
    this.success = success;

    if (depleted) this.oneTime = true;
  }
}
