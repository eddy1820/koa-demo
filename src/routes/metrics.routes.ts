import Router from '@koa/router';
import { Context } from 'koa';
import { container } from '../container/container';
import { TYPES } from '../container/identifiers';
import { MetricsService } from '../services/metrics.service';

const router = new Router();

// Get MetricsService from container
const metricsService = container.get<MetricsService>(TYPES.IMetricsService);

/**
 * GET /metrics
 * Prometheus metrics endpoint
 * No authentication required - this endpoint is called by Prometheus scraper
 */
router.get('/metrics', async (ctx: Context) => {
  ctx.set('Content-Type', metricsService.getContentType());
  ctx.body = await metricsService.getMetrics();
});

export default router;
