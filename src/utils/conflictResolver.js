 export const detectConflict = (local, server) => {
  if (!server) return false;
  return (
    local.updatedAt !== server.updatedAt &&
    (local.syncedVersion || 0) !== server.version
  );
};

export const resolveConflict = (local, server, strategy = 'last-write-wins') => {
  switch (strategy) {
    case 'client-wins':
      return {
        ...server,
        ...local,
        version: (server.version || 1) + 1,
        resolvedAt: Date.now(),
        resolution: 'client-wins',
      };

    case 'server-wins':
      return {
        ...local,
        ...server,
        resolvedAt: Date.now(),
        resolution: 'server-wins',
      };

    case 'merge': {
      const merged = { ...server };
      Object.keys(local).forEach((key) => {
        if (['id', 'updatedAt', 'version', 'synced', 'syncedVersion'].includes(key)) return;
        if (local[key] !== server[key]) {
          merged[key] = local.updatedAt >= server.updatedAt ? local[key] : server[key];
        }
      });
      merged.updatedAt = Math.max(local.updatedAt, server.updatedAt);
      merged.version = (server.version || 1) + 1;
      merged.resolution = 'merge';
      return merged;
    }

    case 'last-write-wins':
    default:
      return local.updatedAt >= server.updatedAt
        ? {
            ...server,
            ...local,
            version: (server.version || 1) + 1,
            resolvedAt: Date.now(),
            resolution: 'last-write-wins (client)',
          }
        : {
            ...local,
            ...server,
            resolvedAt: Date.now(),
            resolution: 'last-write-wins (server)',
          };
  }
};