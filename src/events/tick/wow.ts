import Event from "../../models/core/event.js";
import log from "../../utils/log.js";

export default new Event({
  async callback({ aeonix }) {
    log({
      header: "Tick Event Triggered",
      processName: "TickEvent",
      type: "Info",
    });
  },
  async onError(e) {},
});
