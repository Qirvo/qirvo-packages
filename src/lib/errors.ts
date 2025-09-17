/**
 * Unified error classes and API error response mapping.
 * Phase 1: provides a consistent error taxonomy and HTTP mapping.
 */

export class BaseAppError extends Error {
    public code: string;
    public cause?: unknown;
    constructor(message: string, code = 'app.error', cause?: unknown) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.cause = cause;
    }
}

export class ValidationError extends BaseAppError {
    constructor(message: string, cause?: unknown) {
        super(message, 'app.validation', cause);
    }
}

export class SecurityError extends BaseAppError {
    constructor(message: string, cause?: unknown) {
        super(message, 'app.security', cause);
    }
}

export class PermissionDeniedError extends BaseAppError {
    constructor(message = 'Permission denied', cause?: unknown) {
        super(message, 'app.permission_denied', cause);
    }
}

export class NotFoundError extends BaseAppError {
    constructor(message = 'Resource not found', cause?: unknown) {
        super(message, 'app.not_found', cause);
    }
}

export class ConflictError extends BaseAppError {
    constructor(message = 'Conflict', cause?: unknown) {
        super(message, 'app.conflict', cause);
    }
}

export class InternalError extends BaseAppError {
    constructor(message = 'Internal server error', cause?: unknown) {
        super(message, 'app.internal', cause);
    }
}

// Plugin-specific error classes
export class PluginError extends BaseAppError {
    constructor(message: string, cause?: unknown) {
        super(message, 'plugin.error', cause);
    }
}

export class PluginValidationError extends ValidationError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.code = 'plugin.validation';
    }
}

export class PluginSecurityError extends SecurityError {
    constructor(message: string, cause?: unknown) {
        super(message, cause);
        this.code = 'plugin.security';
    }
}

export class PluginLoadError extends BaseAppError {
    constructor(message: string, cause?: unknown) {
        super(message, 'plugin.load', cause);
    }
}

export class PluginRuntimeError extends BaseAppError {
    constructor(message: string, cause?: unknown) {
        super(message, 'plugin.runtime', cause);
    }
}

export type ApiErrorBody = {
    error: string;
    code: string;
    details?: unknown;
};

export function toHttpStatus(error: unknown): number {
    if (error instanceof ValidationError) return 400;
    if (error instanceof PermissionDeniedError || error instanceof SecurityError) return 403;
    if (error instanceof NotFoundError) return 404;
    if (error instanceof ConflictError) return 409;
    return 500;
}

export function toApiErrorBody(error: unknown): ApiErrorBody {
    if (error instanceof BaseAppError) {
        return { error: error.message, code: error.code };
    }
    return { error: 'Unexpected error', code: 'app.unexpected' };
}

export function apiErrorResponse(error: unknown) {
    const status = toHttpStatus(error);
    const body = toApiErrorBody(error);
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
