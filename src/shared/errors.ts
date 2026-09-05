export class NotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotConfiguredError";
  }
}

export class ExtendedHTTPError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ExtendedHTTPError";
  }
}
