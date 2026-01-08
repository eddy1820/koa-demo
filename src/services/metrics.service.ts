import { injectable } from 'inversify';
import * as client from 'prom-client';

@injectable()
export class MetricsService {
  private register: client.Registry;
  private eventLoopMonitorInterval?: NodeJS.Timeout;

  // HTTP Metrics
  public httpRequestDuration: client.Histogram<string>;
  public httpRequestTotal: client.Counter<string>;
  public httpRequestSizeBytes: client.Histogram<string>;
  public httpResponseSizeBytes: client.Histogram<string>;

  // Database Metrics
  public dbQueryDuration: client.Histogram<string>;
  public dbQueryTotal: client.Counter<string>;
  public dbConnectionPoolSize: client.Gauge<string>;
  public dbConnectionPoolActive: client.Gauge<string>;

  // Business Metrics
  public userRegistrationTotal: client.Counter<string>;
  public userLoginTotal: client.Counter<string>;
  public userLoginFailedTotal: client.Counter<string>;

  // System Metrics
  public eventLoopLag: client.Gauge<string>;

  constructor() {
    // Create a new registry
    this.register = new client.Registry();

    // Enable default Node.js metrics (CPU, memory, GC, etc.)
    client.collectDefaultMetrics({
      register: this.register,
      prefix: 'koa_demo_',
    });

    // Initialize HTTP metrics
    this.httpRequestDuration = new client.Histogram({
      name: 'koa_demo_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'koa_demo_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestSizeBytes = new client.Histogram({
      name: 'koa_demo_http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.register],
    });

    this.httpResponseSizeBytes = new client.Histogram({
      name: 'koa_demo_http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [this.register],
    });

    // Initialize Database metrics
    this.dbQueryDuration = new client.Histogram({
      name: 'koa_demo_db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['query_type', 'entity', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.register],
    });

    this.dbQueryTotal = new client.Counter({
      name: 'koa_demo_db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['query_type', 'entity', 'status'],
      registers: [this.register],
    });

    this.dbConnectionPoolSize = new client.Gauge({
      name: 'koa_demo_db_connection_pool_size',
      help: 'Database connection pool size',
      registers: [this.register],
    });

    this.dbConnectionPoolActive = new client.Gauge({
      name: 'koa_demo_db_connection_pool_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });

    // Initialize Business metrics
    this.userRegistrationTotal = new client.Counter({
      name: 'koa_demo_user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['status'],
      registers: [this.register],
    });

    this.userLoginTotal = new client.Counter({
      name: 'koa_demo_user_logins_total',
      help: 'Total number of successful user logins',
      registers: [this.register],
    });

    this.userLoginFailedTotal = new client.Counter({
      name: 'koa_demo_user_login_failures_total',
      help: 'Total number of failed login attempts',
      labelNames: ['reason'],
      registers: [this.register],
    });

    // Initialize System metrics
    this.eventLoopLag = new client.Gauge({
      name: 'koa_demo_event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.register],
    });

    // Start monitoring event loop lag
    this.monitorEventLoopLag();
  }

  private monitorEventLoopLag(): void {
    let lastCheck = Date.now();

    this.eventLoopMonitorInterval = setInterval(() => {
      const now = Date.now();
      const lag = (now - lastCheck - 1000) / 1000; // Expected 1 second interval
      this.eventLoopLag.set(Math.max(0, lag));
      lastCheck = now;
    }, 1000);
  }

  public cleanup(): void {
    if (this.eventLoopMonitorInterval) {
      clearInterval(this.eventLoopMonitorInterval);
      this.eventLoopMonitorInterval = undefined;
    }
  }

  public async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  public getContentType(): string {
    return this.register.contentType;
  }
}
