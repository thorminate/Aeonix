export class UnableToProcessEventError extends Error {
  constructor(message: string, cause: string) {
    super("Unable to process event");
    this.name = "UnableToProcessEventError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}
export class UnableToProcessCommandError extends Error {
  constructor(message: string, cause: string) {
    super("Unable to process command");
    this.name = "UnableToProcessCommandError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UnableToProcessInteractionError extends Error {
  constructor(message: string, cause: string) {
    super("Unable to process interaction");
    this.name = "UnableToProcessInteractionError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class ChannelNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Channel not found");
    this.name = "ChannelNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class ChannelIsNotTextChannelError extends Error {
  constructor(message: string, cause: string) {
    super("Channel is not text channel");
    this.name = "ChannelIsNotTextChannelError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}
export class UserNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("User not found");
    this.name = "UserNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserCannotBeBannedError extends Error {
  constructor(message: string, cause: string) {
    super("User cannot be banned");
    this.name = "UserCannotBeBannedError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserCannotBeKickedError extends Error {
  constructor(message: string, cause: string) {
    super("User cannot be kicked");
    this.name = "UserCannotBeKickedError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserCannotBeMutedError extends Error {
  constructor(message: string, cause: string) {
    super("User cannot be muted");
    this.name = "UserCannotBeMutedError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserIsBotError extends Error {
  constructor(message: string, cause: string) {
    super("User is a bot");
    this.name = "UserIsBotError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserIsAdminError extends Error {
  constructor(message: string, cause: string) {
    super("User is an admin");
    this.name = "UserIsAdminError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class UserCannotLevelUpError extends Error {
  constructor(message: string, cause: string) {
    super("User cannot level up");
    this.name = "UserCannotLevelUpError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class InvalidTimeoutDurationError extends Error {
  constructor(message: string, cause: string) {
    super("Invalid timeout duration");
    this.name = "InvalidTimeoutDurationError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentAlreadyExistsError extends Error {
  constructor(message: string, cause: string) {
    super("Environment already exists");
    this.name = "EnvironmentAlreadyExistsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class ItemNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Item not found");
    this.name = "ItemNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentCreationError extends Error {
  constructor(message: string, cause: string) {
    super("Environment creation error");
    this.name = "EnvironmentCreationError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentDeletionError extends Error {
  constructor(message: string, cause: string) {
    super("Environment deletion error");
    this.name = "EnvironmentDeletionError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentEditAdjacentsError extends Error {
  constructor(message: string, cause: string) {
    super("Environment edit adjacents error");
    this.name = "EnvironmentEditAdjacentsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentEditChannelError extends Error {
  constructor(message: string, cause: string) {
    super("Environment edit channel error");
    this.name = "EnvironmentEditChannelError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentEditItemsError extends Error {
  constructor(message: string, cause: string) {
    super("Environment edit items error");
    this.name = "EnvironmentEditItemsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentEditNameError extends Error {
  constructor(message: string, cause: string) {
    super("Environment edit name error");
    this.name = "EnvironmentEditNameError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class EnvironmentAlreadyHasItemsError extends Error {
  constructor(message: string, cause: string) {
    super("Environment already has items");
    this.name = "EnvironmentAlreadyHasItemsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class ItemAlreadyExistsError extends Error {
  constructor(message: string, cause: string) {
    super("Item already exists");
    this.name = "ItemAlreadyExistsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class ItemNotInInventoryError extends Error {
  constructor(message: string, cause: string) {
    super("Item not in inventory");
    this.name = "ItemNotInInventoryError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class SkillNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Skill not found");
    this.name = "SkillNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class SkillAlreadyExistsError extends Error {
  constructor(message: string, cause: string) {
    super("Skill already exists");
    this.name = "SkillAlreadyExistsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class StatusEffectNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Status effect not found");
    this.name = "StatusEffectNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class StatusEffectAlreadyExistsError extends Error {
  constructor(message: string, cause: string) {
    super("Status effect already exists");
    this.name = "StatusEffectAlreadyExistsError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class StatusEffectDurationError extends Error {
  constructor(message: string, cause: string) {
    super("Status effect duration error");
    this.name = "StatusEffectDurationError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}
