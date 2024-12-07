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
export class UserNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("User not found");
    this.name = "UserNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class RoleNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Role not found");
    this.name = "RoleNotFoundError";
    this.message = message;
    this.stack = new Error().stack;
    this.cause = cause;
  }
}

export class GuildNotFoundError extends Error {
  constructor(message: string, cause: string) {
    super("Guild not found");
    this.name = "GuildNotFoundError";
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

export default {
  UnableToProcessEventError,
  UnableToProcessCommandError,
  UnableToProcessInteractionError,
  ChannelNotFoundError,
  UserNotFoundError,
  RoleNotFoundError,
  GuildNotFoundError,
  EnvironmentAlreadyExistsError,
  EnvironmentCreationError,
  EnvironmentDeletionError,
  EnvironmentEditAdjacentsError,
  EnvironmentEditChannelError,
  EnvironmentEditItemsError,
  EnvironmentEditNameError,
  EnvironmentAlreadyHasItemsError,
  ItemNotFoundError,
  ItemAlreadyExistsError,
  ItemNotInInventoryError,
};
