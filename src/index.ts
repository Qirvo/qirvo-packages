// Main entry point for @qirvo/packages
export type * from './lib';
export type * from './types';

// Re-export commonly used items to avoid conflicts
export * from './lib/manifest-canonical';

// Export runtime schemas (not type-only)
export {
    GoalSchema,
    TaskSchema,
    UserSchema,
    DailyPlanSchema,
    RegistrationSchema
} from './types/schemas';

// Export types
export type {
    Goal,
    Task,
    User,
    DailyPlan
} from './types/schemas';

