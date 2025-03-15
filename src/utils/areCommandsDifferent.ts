import { ApplicationCommand } from "discord.js";
import Command from "../commands/command";

// checks if local command is different to existing command
export default function (
  existingCommand: ApplicationCommand,
  localCommand: Command
) {
  // Export the function.
  const areChoicesDifferent = (existingChoices: any, localChoices: any) => {
    // Define the areChoicesDifferent function.
    for (const localChoice of localChoices) {
      // Loop through the localChoices array.
      const existingChoice = existingChoices?.find(
        // Find the choice in the existingChoices array.
        (choice: { name: any }) => choice.name === localChoice.name // If the choice name matches the localChoice name, return true.
      );

      if (!existingChoice) {
        // If the existingChoice is not found, return true.
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        // If the localChoice value is different from the existingChoice value, return true.
        return true;
      }
    }
    return false;
  };

  // If existingOptions is different to localOptions, return true.
  const areOptionsDifferent = (existingOptions: any, localOptions: any) => {
    // Define the areOptionsDifferent function.
    for (const localOption of localOptions) {
      // Loop through the localOptions array.
      const existingOption = existingOptions?.find(
        // Find the option in the existingOptions array.
        (option: any) => option.name === localOption.name // If the option name matches the localOption name, return true.
      );

      if (!existingOption) {
        // If the existingOption is not found, return true.
        return true;
      }

      if (
        localOption.description !== existingOption.description || // If the localOption description is different from the existingOption description, return true.
        localOption.type !== existingOption.type || // If the localOption type is different from the existingOption type, return true.
        (localOption.required || false) !== existingOption.required || // If the localOption required is different from the existingOption required, return true.
        (localOption.choices?.length || 0) !==
          (existingOption.choices?.length || 0) || // If the localOption choices length is different from the existingOption choices length, return true.
        areChoicesDifferent(
          // If the areChoicesDifferent function returns true, return true.
          localOption.choices || [],
          existingOption.choices || []
        )
      ) {
        return true;
      }
    }
    return false;
  };

  if (
    // If the following conditions are true, return true.
    existingCommand.description !== localCommand.data.description ||
    existingCommand.options?.length !==
      (localCommand.data.options?.length || 0) ||
    areOptionsDifferent(
      existingCommand.options,
      localCommand.data.options || []
    )
  ) {
    return true;
  }

  return false;
}
