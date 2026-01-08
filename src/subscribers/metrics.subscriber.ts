import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { container } from '../container/container';
import { TYPES } from '../container/identifiers';
import { MetricsService } from '../services/metrics.service';

// TypeORM Query Event interface
interface QueryEvent {
  query?: string;
  __queryId?: string;
}

// Store query start times
const queryStartTimes = new Map<string, number>();

@EventSubscriber()
export class MetricsSubscriber implements EntitySubscriberInterface {
  private metricsService: MetricsService | null = null;

  constructor() {
    // Get MetricsService from container
    // Use a try-catch because the container might not be ready during initialization
    try {
      this.metricsService = container.get<MetricsService>(TYPES.IMetricsService);
    } catch (error) {
      // Container not ready yet, will be initialized later
      console.warn('MetricsService not available during subscriber initialization');
    }
  }

  /**
   * Called before a query is executed
   */
  beforeQuery(event: QueryEvent): void {
    if (event.query) {
      const queryId = `${Date.now()}_${Math.random()}`;
      queryStartTimes.set(queryId, Date.now());
      // Store the queryId in the event for later retrieval
      event.__queryId = queryId;
    }
  }

  /**
   * Called after a query is executed
   */
  afterQuery(event: QueryEvent): void {
    if (!this.metricsService) {
      // Try to get service again if it wasn't available during construction
      try {
        this.metricsService = container.get<MetricsService>(TYPES.IMetricsService);
      } catch (error) {
        return;
      }
    }

    if (event.query && event.__queryId) {
      const queryId = event.__queryId;
      const startTime = queryStartTimes.get(queryId);

      if (startTime) {
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        queryStartTimes.delete(queryId);

        // Determine query type
        const query = event.query.toUpperCase();
        let queryType = 'UNKNOWN';
        if (query.startsWith('SELECT')) queryType = 'SELECT';
        else if (query.startsWith('INSERT')) queryType = 'INSERT';
        else if (query.startsWith('UPDATE')) queryType = 'UPDATE';
        else if (query.startsWith('DELETE')) queryType = 'DELETE';

        // Record metrics
        this.metricsService.dbQueryDuration.observe(
          {
            query_type: queryType,
            entity: 'unknown',
            status: 'success',
          },
          duration
        );

        this.metricsService.dbQueryTotal.inc({
          query_type: queryType,
          entity: 'unknown',
          status: 'success',
        });
      }
    }
  }

  /**
   * Called after entity insertion
   */
  afterInsert(event: InsertEvent<unknown>): void {
    if (!this.metricsService) return;

    const entityName = event.metadata.name;
    this.metricsService.dbQueryTotal.inc({
      query_type: 'INSERT',
      entity: entityName,
      status: 'success',
    });
  }

  /**
   * Called after entity update
   */
  afterUpdate(event: UpdateEvent<unknown>): void {
    if (!this.metricsService) return;

    const entityName = event.metadata.name;
    this.metricsService.dbQueryTotal.inc({
      query_type: 'UPDATE',
      entity: entityName,
      status: 'success',
    });
  }

  /**
   * Called after entity removal
   */
  afterRemove(event: RemoveEvent<unknown>): void {
    if (!this.metricsService) return;

    const entityName = event.metadata.name;
    this.metricsService.dbQueryTotal.inc({
      query_type: 'DELETE',
      entity: entityName,
      status: 'success',
    });
  }

  /**
   * Called after entity load
   */
  afterLoad(entity: unknown, event?: LoadEvent<unknown>): void {
    if (!this.metricsService || !event) return;

    const entityName = event.metadata.name;
    this.metricsService.dbQueryTotal.inc({
      query_type: 'SELECT',
      entity: entityName,
      status: 'success',
    });
  }
}
