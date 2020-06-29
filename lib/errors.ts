export class MissingHttpsOptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingHttpsOptionError';
  }
}

export class MissingStaticFileOptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingStaticFileOption';
  }
}

export class FileReadFailureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileReadFailureError';
  }
}
