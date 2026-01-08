import { Context, Next } from 'koa';
import { MetricsService } from '../services/metrics.service';

/**
 * Normalize route paths to prevent cardinality explosion
 * Example: /api/users/123 -> /api/users/:id
 * Example: /api/users/uuid-abc-def -> /api/users/:id
 */
function normalizeRoutePath(path: string): string {
  // Replace UUID patterns
  let normalized = path.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    '/:id'
  );

  // Replace numeric IDs
  normalized = normalized.replace(/\/\d+/g, '/:id');

  return normalized;
}

/**
 * Create metrics middleware for tracking HTTP requests
 */
export function createMetricsMiddleware(metricsService: MetricsService) {
  return async (ctx: Context, next: Next) => {
    const start = Date.now();
    const route = normalizeRoutePath(ctx.path);

    // Track request size
    const requestSize = ctx.request.length || 0;
    if (requestSize > 0) {
      metricsService.httpRequestSizeBytes.observe(
        {
          method: ctx.method,
          route,
        },
        requestSize
      );
    }

    try {
      // Execute next middleware
      await next();
    } finally {
      // Calculate duration
      const duration = (Date.now() - start) / 1000; // Convert to seconds

      // Record request duration
      metricsService.httpRequestDuration.observe(
        {
          method: ctx.method,
          route,
          status_code: String(ctx.status),
        },
        duration
      );

      // Increment request counter
      metricsService.httpRequestTotal.inc({
        method: ctx.method,
        route,
        status_code: String(ctx.status),
      });

      // Track response size
      const responseSize = ctx.response.length || 0;
      if (responseSize > 0) {
        metricsService.httpResponseSizeBytes.observe(
          {
            method: ctx.method,
            route,
          },
          responseSize
        );
      }
    }
  };
}
