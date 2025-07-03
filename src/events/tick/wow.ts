import Event from "../../models/core/event.js";

export default new Event<[currentTime: number]>({
  async callback({ aeonix, args: [currentTime] }) {},
  async onError(e) {},
});
