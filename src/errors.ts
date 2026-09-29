/** Only deliberately public messages may cross the HTTP boundary. */
export class RequestError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export class StoredDataError extends RequestError {
  constructor(kind: string, options?: ErrorOptions) {
    super(
      `Saved ${kind} could not be read. The original file was left unchanged.`,
      500,
    );
    this.cause = options?.cause;
  }
}

export class ConflictError extends RequestError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class NotFoundError extends RequestError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UpstreamError extends RequestError {
  constructor(message: string) {
    super(message, 502);
  }
}
