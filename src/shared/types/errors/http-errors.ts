export class AppException extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly message: string;

  constructor(message: string, statusCode: number, error: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    Error.captureStackTrace(this, new.target);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      error: this.error,
    };
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Bad Request') {
    super(message, 400, 'Bad Request');
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized');
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403, 'Forbidden');
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Not Found') {
    super(message, 404, 'Not Found');
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict') {
    super(message, 409, 'Conflict');
  }
}

export class UnprocessableEntityException extends AppException {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422, 'Unprocessable Entity');
  }
}

export class InternalServerErrorException extends AppException {
  constructor(message = 'Internal Server Error') {
    super(message, 500, 'Internal Server Error');
  }
}

export class UnauthorizedError extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized Error');
  }
}
