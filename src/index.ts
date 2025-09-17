// Main entry point for @qirvo/packages
export type * from './lib';
export type * from './types';

// Re-export commonly used items to avoid conflicts
export * from './lib/manifest-canonical';
export type { Goal, GoalSchema, Task, TaskSchema, User, UserSchema } from './types/schemas';

