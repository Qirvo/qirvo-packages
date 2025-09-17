import { PluginManifest } from "./schemas";

export interface PluginAuthor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  website?: string;
}

export interface PluginUploadedBy {
  id?: string;
  name?: string;
  email?: string;
}

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: PluginAuthor;
  uploadedBy: PluginUploadedBy;
  category: string;
  keywords: string[];
  price: number;
  currency: string;
  free: boolean;
  verified: boolean;
  featured: boolean;
  published: boolean;
  rating: number;
  downloads: number;
  hasWidget: boolean;
  hasConfig: boolean;
  commands: any[];
  manifest: PluginManifest;
  packageJson?: any;
  storagePath?: string;
  userInstalled?: boolean;
  repository?: string;
  createdAt: string;
  updatedAt: string;
  screenshots: string[];
  installed?: boolean;
  enabled?: boolean;
  firebaseFiles?: Record<string, string>;
  storageLocation?: string;
  // Files stored in database for runtime loading
  pluginFiles?: Record<string, string>;
}

export interface PluginInstallation {
  userId: string;
  pluginId: string;
  plugin: PluginMetadata;
  installedAt: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface PluginSearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  free?: boolean;
  verified?: boolean;
  featured?: boolean;
  installed?: boolean;
  enabled?: boolean;
  minRating?: number;
  sortBy?: 'name' | 'rating' | 'downloads' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PluginListResponse {
  success: boolean;
  plugins: PluginMetadata[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface InstalledPlugin extends PluginMetadata {
  installed: true;
  enabled: boolean;
  config?: Record<string, any>;
  installedAt: string;
  usageCount?: number;
  lastUsed?: string;
  size?: string;
  widgets?: Array<{
    name: string;
    description: string;
    type: string;
  }>;
}

export interface PluginInstallResponse {
  success: boolean;
  message: string;
  plugin?: {
    id: string;
    name: string;
    version: string;
  };
}

export interface PluginRatingData {
  pluginId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PluginRatingResponse {
  success: boolean;
  message: string;
  data?: {
    userRating: number;
    pluginAverageRating: number;
    totalRatings: number;
  };
}

// Admin approval workflow types
export type PluginApprovalStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface PluginApprovalRequest {
  id: string;
  pluginId: string;
  plugin: PluginMetadata;
  submittedBy: string;
  submittedAt: string;
  status: PluginApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  securityFlags?: string[];
  complianceChecks?: {
    codeReview: boolean;
    securityScan: boolean;
    performanceTest: boolean;
    documentationComplete: boolean;
  };
}

export interface AdminPluginAction {
  action: 'approve' | 'reject' | 'request_changes' | 'flag_security';
  comments?: string;
  rejectionReason?: string;
  securityFlags?: string[];
}

export interface AdminDashboardStats {
  totalPlugins: number;
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  securityFlags: number;
  averageReviewTime: number;
}

export interface PluginSecurityScan {
  pluginId: string;
  scanDate: string;
  status: 'clean' | 'warning' | 'critical';
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    file?: string;
    line?: number;
  }>;
  permissions: string[];
  networkAccess: boolean;
  fileSystemAccess: boolean;
}

export interface PluginExecutionContext {
  pluginId: string;
  userId: string;
  permissions: string[];
  startTime: number;
  apiCallCount: number;
  memoryUsage: number;
  eventListeners: Set<any>;
}

export interface SandboxConfig {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  allowedDomains: string[];
  blockedAPIs: string[];
  resourceLimits: {
    maxStorageSize: number;
    maxApiCalls: number;
    maxEventListeners: number;
  };
}
