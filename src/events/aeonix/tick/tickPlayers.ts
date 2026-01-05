import AeonixEvent from "#core/aeonixEvent.js";

export default new AeonixEvent<"tick">({
  async callback({
    aeonix,
    args: [currentTime, currentDay, currentMonth, currentYear],
  }) {
    aeonix.players
      .array() // only ticks players in cache
      .forEach((player) =>
        player.emit("tick", currentTime, currentDay, currentMonth, currentYear)
      );
    await aeonix.savePlayers();
  },
  async onError(e, { aeonix }) {
    aeonix.logger.error("TickPlayers", "Error with tickPlayers event", e);
  },
});
