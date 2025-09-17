import { CANONICAL_PERMISSIONS } from '@/constants/coninical-permissions';
import { z } from 'zod';

export type CanonicalPermission = typeof CANONICAL_PERMISSIONS[number];

// Canonical manifest schema per spec
export const CanonicalPluginManifestSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string().min(1),
    author: z.union([
        z.string().min(1),
        z.object({
            name: z.string().min(1),
            email: z.string().optional(),
            website: z.string().optional(),
        })
    ]),
    license: z.string().optional(),
    entryPoint: z.string().min(1),
    dependencies: z.record(z.string(), z.string()).optional(),
    hooks: z.array(z.string()).optional().default([]),
    permissions: z.array(z.enum(['network-access', 'storage-read', 'storage-write', 'filesystem-access', 'notifications', 'clipboard-read', 'clipboard-write', 'geolocation', 'camera', 'microphone', 'calendar', 'contacts'])).optional().default([]),
    configSchema: z.any().optional(),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
});

export type CanonicalPluginManifest = z.infer<typeof CanonicalPluginManifestSchema>;

function mapLegacyPermissionToCanonical(perm: string): CanonicalPermission | null {
    const mapping: Record<string, CanonicalPermission> = {
        // legacy string styles used in current codebase
        'storage.read': 'storage-read',
        'storage.write': 'storage-write',
        'network.request': 'network-access',
        'notifications.show': 'notifications',
        'clipboard.read': 'clipboard-read',
        'clipboard.write': 'clipboard-write',
        'geolocation.read': 'geolocation',
        'camera.access': 'camera',
        'microphone.access': 'microphone',
        // object.type mappings
        storage: 'storage-read',
        network: 'network-access',
        filesystem: 'filesystem-access',
        notifications: 'notifications',
        calendar: 'calendar',
        contacts: 'contacts',
        location: 'geolocation',
        camera: 'camera',
        microphone: 'microphone',
    };
    return mapping[perm] ?? null;
}

export function normalizePermissionStrings(perms: string[] | undefined): { permissions: CanonicalPermission[]; warnings: string[] } {
    const warnings: string[] = [];
    const out = new Set<CanonicalPermission>();
    (perms || []).forEach(p => {
        const mapped = mapLegacyPermissionToCanonical(p);
        if (mapped) out.add(mapped);
        else warnings.push(`Unknown permission: ${p}`);
    });
    return { permissions: Array.from(out), warnings };
}

export function normalizePermissionObjects(perms: Array<{ type: string }> | undefined): { permissions: CanonicalPermission[]; warnings: string[] } {
    const warnings: string[] = [];
    const out = new Set<CanonicalPermission>();
    (perms || []).forEach(p => {
        const mapped = mapLegacyPermissionToCanonical(p.type);
        if (mapped) out.add(mapped);
        else warnings.push(`Unknown permission type: ${p.type}`);
    });
    return { permissions: Array.from(out), warnings };
}

// Adapter: accepts various manifest shapes and outputs canonical manifest + warnings
export function adaptToCanonicalManifest(input: any): { manifest: CanonicalPluginManifest; warnings: string[] } {
    const warnings: string[] = [];
    // Preserve author format (string or object)
    const author = typeof input?.author === 'string'
        ? input.author
        : typeof input?.author === 'object' && input.author?.name
            ? input.author
            : 'unknown';

    // entryPoint resolution
    const entryPoint = input?.entryPoint || input?.entry || input?.main || input?.web || input?.background;
    if (!entryPoint) warnings.push('No explicit entryPoint found; attempted to map from entry/main/web/background');

    // permissions normalization (supports objects or strings)
    let permResult = { permissions: [] as CanonicalPermission[], warnings: [] as string[] };
    if (Array.isArray(input?.permissions) && input.permissions.length > 0) {
        if (typeof input.permissions[0] === 'string') {
            permResult = normalizePermissionStrings(input.permissions as string[]);
        } else if (typeof input.permissions[0] === 'object') {
            permResult = normalizePermissionObjects(input.permissions as Array<{ type: string }>);
        }
    }
    warnings.push(...permResult.warnings);

    // hooks normalization: support array or object with function names
    let hooks: string[] = [];
    if (Array.isArray(input?.hooks)) hooks = input.hooks as string[];
    else if (typeof input?.hooks === 'object' && input.hooks) hooks = Object.keys(input.hooks);

    // config schema mapping
    const configSchema = input?.configSchema ?? input?.config_schema;

    const canonical: CanonicalPluginManifest = {
        id: input?.id,
        name: input?.name,
        version: input?.version,
        description: input?.description,
        author: author,
        license: input?.license,
        entryPoint: entryPoint,
        dependencies: input?.dependencies,
        hooks,
        permissions: permResult.permissions,
        configSchema,
        categories: input?.categories || (input?.category ? [input.category] : []),
        tags: input?.tags || input?.keywords || [],
    };

    // Validate and return
    const parsed = CanonicalPluginManifestSchema.safeParse(canonical);
    if (!parsed.success) {
        const errs = parsed.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        warnings.push(...errs);
    }
    return { manifest: canonical, warnings };
}
