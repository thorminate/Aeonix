export default class ContextualError extends Error {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: unknown
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = this.constructor.name;

    if (context) {
      this.context = sanitizeContext(context);
    }
  }

  context?: Record<string, unknown>;
}

function sanitizeContext(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(obj)) {
    if (v instanceof Error) {
      out[k] = {
        name: v.name,
        message: v.message,
      };
    } else {
      out[k] = v;
    }
  }

  return out;
}
