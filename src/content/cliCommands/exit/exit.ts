import CLICommand from "#cli/cliCommand.js";

export default new CLICommand({
  name: "exit",
  description: "Turns off the Aeonix.",
  options: [],
  acceptsPrimaryArg: false,
  shouldReprompt: false,
  async execute({ aeonix }) {
    aeonix.exit();
  },
});
