export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Authentication Errors
export class AccountAlreadyExistsError extends AppError {
  constructor(message = 'Account already exists') {
    super(message, 409, 'ACCOUNT_ALREADY_EXISTS');
  }
}

export class AccountLockedError extends AppError {
  constructor(message = 'Account is locked due to too many failed login attempts. Please try again after 15 minutes.') {
    super(message, 429, 'ACCOUNT_LOCKED');
  }
}

export class InvalidCredentialsError extends AppError {
  public readonly remainingAttempts?: number;

  constructor(remainingAttempts?: number) {
    const message = remainingAttempts !== undefined
      ? `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
      : 'Invalid credentials.';
    super(message, 401, 'INVALID_CREDENTIALS');
    this.remainingAttempts = remainingAttempts;
  }
}

export class AccountNotFoundError extends AppError {
  constructor(message = 'Account not found') {
    super(message, 404, 'ACCOUNT_NOT_FOUND');
  }
}

// User Profile Errors
export class UserNotFoundError extends AppError {
  constructor(message = 'User not found') {
    super(message, 404, 'USER_NOT_FOUND');
  }
}

export class UserProfileNotFoundError extends AppError {
  constructor(message = 'User profile not found. Please create a profile first.') {
    super(message, 404, 'USER_PROFILE_NOT_FOUND');
  }
}

export class UsernameAlreadyExistsError extends AppError {
  constructor(message = 'Username already exists') {
    super(message, 409, 'USERNAME_ALREADY_EXISTS');
  }
}

export class UserProfileAlreadyExistsError extends AppError {
  constructor(message = 'Account already has a user profile') {
    super(message, 409, 'USER_PROFILE_ALREADY_EXISTS');
  }
}

// Validation Errors
export class InvalidUserIdError extends AppError {
  constructor(message = 'Invalid user ID') {
    super(message, 400, 'INVALID_USER_ID');
  }
}

// Rate Limiting Errors
export class TooManyAttemptsError extends AppError {
  constructor(message = 'Too many failed login attempts. Please try again later.') {
    super(message, 429, 'TOO_MANY_ATTEMPTS');
  }
}
