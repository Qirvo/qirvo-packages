import { CANONICAL_PERMISSIONS } from '@/constants/coninical-permissions';
import { CanonicalPluginManifest, CanonicalPluginManifestSchema, adaptToCanonicalManifest, normalizePermissionObjects, normalizePermissionStrings } from './manifest-canonical';

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: T;
}

export function validatePluginManifest(manifestData: any): ValidationResult<CanonicalPluginManifest> {
  try {
    // Adapt arbitrary manifest shapes to canonical + gather warnings
    const adapted = adaptToCanonicalManifest(manifestData);

    // Validate canonical manifest
    const result = CanonicalPluginManifestSchema.safeParse(adapted.manifest);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`),
        warnings: adapted.warnings
      };
    }

    const manifest: CanonicalPluginManifest = result.data;
    const warnings: string[] = [...adapted.warnings];

    // Additional advisory warnings
    if (!manifest.categories || manifest.categories.length === 0) {
      warnings.push('No categories provided - recommended for marketplace discovery');
    }
    if (!manifest.tags || manifest.tags.length === 0) {
      warnings.push('No tags provided - recommended for discoverability');
    }
    if ((manifest.permissions?.length || 0) > 0) {
      warnings.push(`Plugin requests ${manifest.permissions?.length} permissions - ensure users understand what access is needed`);
    }

    return {
      valid: true,
      errors: [],
      warnings,
      manifest
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

export function sanitizePluginData(data: any): any {
  // Remove potentially dangerous fields
  const sanitized = { ...data };

  // Remove script tags and dangerous HTML
  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitized.description
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Sanitize author field
  if (typeof sanitized.author === 'string') {
    sanitized.author = sanitized.author
      .replace(/<[^>]*>/g, '')
      .substring(0, 100); // Limit length
  }

  // Ensure tags are clean
  if (Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .map((tag: any) => typeof tag === 'string' ? tag.replace(/[^a-zA-Z0-9-_]/g, '') : '')
      .filter((tag: string) => tag.length > 0)
      .slice(0, 10); // Max 10 tags
  }

  return sanitized;
}

export function validatePluginFile(buffer: Buffer): ValidationResult<any> {
  try {
    // Basic file validation
    if (buffer.length === 0) {
      return {
        valid: false,
        errors: ['Plugin file is empty'],
        warnings: []
      };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return {
        valid: false,
        errors: [`Plugin file too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max: 50MB)`],
        warnings: []
      };
    }

    // Check if it's a valid tar.gz file by checking magic bytes
    const magicBytes = buffer.subarray(0, 3);
    const isGzip = magicBytes[0] === 0x1f && magicBytes[1] === 0x8b && magicBytes[2] === 0x08;

    if (!isGzip) {
      return {
        valid: false,
        errors: ['Plugin file must be a valid .tgz (tar.gz) archive'],
        warnings: []
      };
    }

    return {
      valid: true,
      errors: [],
      warnings: []
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

export function generatePluginId(name: string, author: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanAuthor = author.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now().toString(36);
  return `${cleanAuthor}-${cleanName}-${timestamp}`;
}

export function validatePluginPermissions(permissions: Array<string | { type: string }>): { valid: boolean; errors: string[]; normalized: readonly typeof CANONICAL_PERMISSIONS[number][] } {
  const errors: string[] = [];
  let normalized: readonly typeof CANONICAL_PERMISSIONS[number][] = [];

  if (!Array.isArray(permissions)) {
    return { valid: true, errors: [], normalized };
  }

  const first = permissions[0];
  if (typeof first === 'string') {
    const res = normalizePermissionStrings(permissions as string[]);
    normalized = res.permissions;
    errors.push(...res.warnings);
  } else if (typeof first === 'object') {
    const res = normalizePermissionObjects(permissions as Array<{ type: string }>);
    normalized = res.permissions;
    errors.push(...res.warnings);
  }

  // Ensure all normalized permissions are within canonical set
  const canon = new Set(CANONICAL_PERMISSIONS);
  normalized.forEach(p => { if (!canon.has(p)) errors.push(`Non-canonical permission: ${p}`); });

  return { valid: errors.length === 0, errors, normalized };
}
