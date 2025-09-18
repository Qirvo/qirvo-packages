import { CANONICAL_PERMISSIONS } from '@/constants/canonical-permissions';
import { z } from 'zod';

// Base schemas
export const UserSchema = z.object({
  id: z.string(), // Corresponds to Firebase UID
  email: z.string().email(),
  passwordHash: z.string().optional(), // Not stored if using Firebase Auth directly for password handling
  isEmailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  role: z.enum(['user', 'admin']).default('user'),
  lastLogin: z.date().optional(),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().optional(), // Encrypted 2FA secret
  recoveryCodes: z.array(z.string()).default([]), // Hashed recovery codes

  // Telegram Integration Fields
  telegramId: z.string().optional(),
  telegramUsername: z.string().optional(),
  telegramFirstName: z.string().optional(),
  telegramLastName: z.string().optional(),

  // Notification Preferences
  emailNotificationsEnabled: z.boolean().default(true),

  // Profile Information
  displayName: z.string().optional(), // User-chosen display name
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(), // URL to profile picture (e.g., from Firebase Storage)
  bio: z.string().max(500).optional(), // Short user biography
  timezone: z.string().optional(), // E.g., "America/New_York"

  // Trial and Subscription Fields
  trialStart: z.date().optional(), // When the trial period started
  trialEnd: z.date().optional(), // When the trial period ends
  subscriptionStatus: z.enum(['trial', 'active', 'cancelled', 'expired', 'pending']).default('trial'),
  subscriptionType: z.string().optional(), // e.g., 'daily-planning-ai', 'teams'
  subscriptionEndDate: z.date().optional(), // When the subscription ends
  lifetime: z.boolean().default(false), // Whether user has lifetime access
  teamAdminId: z.string().optional(), // For team members, ID of the team admin

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DailyPlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  priority1: z.string().optional(),
  priority2: z.string().optional(),
  priority3: z.string().optional(),
  morningNotes: z.string().optional(),
  accomplishments: z.string().optional(),
  challenges: z.string().optional(),
  tomorrowFocus: z.string().optional(),
  reflectionNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const _DailySummarySchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  day: z.string(),
  summary: z.string(),
  focus: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const _ErrorSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const TaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()).default([]),
  goalId: z.string().optional(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['planning', 'in-progress', 'review', 'completed']).default('planning'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const HealthLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  mood: z.number().min(1).max(10).optional(),
  energy: z.number().min(1).max(10).optional(),
  pain: z.number().min(1).max(10).optional(),
  sleep: z.number().min(0).max(24).optional(),
  weight: z.number().optional(),
  nutrition: z.array(z.string()).default([]),
  supplements: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectPhaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['planning', 'in-progress', 'review', 'completed']).default('planning'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProjectTaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  phaseId: z.string(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const BulletEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.date(),
  type: z.enum(['task', 'event', 'note']),
  content: z.string(),
  completed: z.boolean().optional(),
  collectionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EchoTaskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  command: z.string(),
  output: z.string(),
  timestamp: z.date(),
  status: z.enum(['success', 'error', 'pending']).default('pending'),
  executionTime: z.number().optional(), // milliseconds
  workingDirectory: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ReminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  time: z.string(),
  method: z.enum(['telegram', 'email', 'both']).default('telegram'),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AIInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Plugin permission schema validation
export const PluginPermissionSchema = z.object({
  type: z.enum(CANONICAL_PERMISSIONS),
  description: z.string().min(1, 'Permission description is required'),
  required: z.boolean().default(false)
});

// Plugin author schema validation
export const PluginAuthorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().url('Provide a URL to the author\'s avatar image').optional(),
  website: z.string().url('Invalid website URL').optional()
});

// Plugin category schema validation
export const PluginCategorySchema = z.enum(['productivity', 'communication', 'utilities', 'integrations', 'ai', 'entertainment', 'finance', 'health', 'education', 'other']);

// Plugin size schema validation
export const PluginSizeSchema = z.enum(['small', 'medium', 'large']);

// Plugin position schema validation
export const PluginPositionSchema = z.enum(['sidebar', 'main', 'floating']);

// Plugin option schema validation
export const PluginOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  description: z.string().min(1, 'Option description is required'),
  type: z.enum(['string', 'number', 'boolean']).default('string'),
  required: z.boolean().default(false),
  default: z.any().optional()
});

// Plugin command schema validation
export const PluginCommandSchema = z.object({
  name: z.string().min(1, 'Command name is required'),
  description: z.string().min(1, 'Command description is required'),
  usage: z.string().optional(),
  aliases: z.array(z.string()).optional().default([]),
  options: z.array(PluginOptionSchema).optional().default([])
});

// Plugin Runtime System Types - aligned with canonical manifest
export const PluginConfigFieldSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'select']),
  required: z.boolean(),
  default: z.any().optional(),
  options: z.union([
    z.array(z.string()),
    z.array(z.object({
      value: z.string(),
      label: z.string()
    }))
  ]).optional(),
  description: z.string().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
});

// Plugin manifest schema validation
export const PluginManifestSchema = z.object({
  manifest_version: z.number().int().positive('Manifest version must be a positive integer'),
  name: z.string().min(1, 'Plugin name is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  author: PluginAuthorSchema,
  category: PluginCategorySchema,
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  permissions: z.array(PluginPermissionSchema),
  type: z.enum(['plugin', 'dashboard-widget', 'widget', 'background', 'cli-command', 'integration', 'full']).default('widget'),
  loadedAt: z.string().optional(), // ISO timestamp when plugin was loaded
  updatedAt: z.string().optional(), // ISO timestamp when plugin was last updated
  createdAt: z.string().optional(), // ISO timestamp when plugin was created
  entry: z.string().min(1, 'Entry file is required'),
  icon: z.string().url('Icon must be a valid URL').optional(),
  screenshot: z.string().url('Screenshot must be a valid URL').optional(),
  widgets: z.array(z.object({
    name: z.string().min(1, 'Widget name is required'),
    component: z.string().min(1, 'Widget component is required'),
    description: z.string().min(1, 'Widget description is required'),
    size: PluginSizeSchema.optional(),
    defaultSize: PluginSizeSchema.optional(),
    position: PluginPositionSchema.optional(),
    configSchema: z.record(z.string(), PluginConfigFieldSchema.optional()).optional(),
    permissions: z.array(PluginPermissionSchema).optional().default([]),
  })).optional(),
  license: z.string().optional().default('MIT'),
  repository: z.string().url('Repository must be a valid URL').optional(),
  homepage: z.string().url('Homepage must be a valid URL').optional(),
  externalServices: z.array(z.object({
    name: z.string().min(1, 'Service name is required'),
    type: z.string().min(1, 'Service type is required'),
    description: z.string().min(1, 'Service description is required'),
    baseUrl: z.string().url('Service URL must be a valid URL'),
    auth: z.string().optional(),
    apiKeyRequired: z.boolean().default(false)
  })).optional(),
  pages: z.array(z.object({
    name: z.string().min(1, 'Page name is required'),
    route: z.string().min(1, 'Page route is required'),
    component: z.string().min(1, 'Page component is required'),
    description: z.string().optional(),
    permissions: z.array(PluginPermissionSchema).optional().default([]),
    manuItems: z.object({
      label: z.string().min(1, 'Menu label is required'),
      icon: z.string().optional(),
      position: z.enum(['top', 'bottom', 'sidebar']).default('sidebar'),
      order: z.number().optional(),
      parent: z.string().optional()
    }).optional()
  })).optional(),
  engines: z.object({
    node: z.string().optional(),
    npm: z.string().optional(),
    qirvo: z.string().optional(),
  }).optional(),
  commands: z.array(PluginCommandSchema).optional(),
  // Lifecycle hooks
  hooks: z.object({
    onInstall: z.string().optional(),
    onUninstall: z.string().optional(),
    onEnable: z.string().optional(),
    onDisable: z.string().optional(),
    onUpdate: z.string().optional(),
  }).optional(),
  apiEndPoints: z.array(z.object({
    name: z.string().min(1, 'API endpoint name is required'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
    route: z.string().min(1, 'API route is required'),
    description: z.string().optional(),
    permissions: z.array(PluginPermissionSchema).optional().default([]),
    authRequired: z.boolean().default(false),
    handler: z.string().min(1, 'Handler function name is required')
  })).optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  free: z.boolean().optional(),
  dependencies: z.record(z.string(), z.any()).optional(),
  peerDependencies: z.record(z.string(), z.any()).optional(),
  keywords: z.array(z.string()).optional(),
  main: z.string().optional(),
  web: z.string().optional(),
  background: z.string().optional(),
  // Configuration
  config_schema: z.record(z.string(), z.any()).optional(),
  default_config: z.record(z.string(), z.any()).optional(),
});

// Schema for client-side validation
export const RegistrationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password should be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password should be at least 6 characters' }),
  displayName: z.string().min(1, { message: 'Display name is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // path to field that will display the error
});

// Types derived from schemas
export type User = z.infer<typeof UserSchema>;
export type DailyPlan = z.infer<typeof DailyPlanSchema>;
export type DailySummary = z.infer<typeof _DailySummarySchema>;
export type ErrorSummary = z.infer<typeof _ErrorSummarySchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type HealthLog = z.infer<typeof HealthLogSchema>;
export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>;
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;
export type BulletEntry = z.infer<typeof BulletEntrySchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type EchoTask = z.infer<typeof EchoTaskSchema>;
export type Reminder = z.infer<typeof ReminderSchema>;
export type AIInsight = z.infer<typeof AIInsightSchema>;
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
export type Registration = z.infer<typeof RegistrationSchema>;
export type PluginConfigField = z.infer<typeof PluginConfigFieldSchema>;
