import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { BackofficeRebalanceJobService } from './backoffice-rebalance-job.service';

const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;

@Injectable()
export class BackofficeRebalanceSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BackofficeRebalanceSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly rebalanceJobService: BackofficeRebalanceJobService) {}

  onModuleInit() {
    const enabled = process.env.BACKOFFICE_REBALANCE_SCHEDULER_ENABLED !== 'false';
    if (!enabled) {
      return;
    }

    const intervalMs = Number(process.env.BACKOFFICE_REBALANCE_SCHEDULER_INTERVAL_MS || DEFAULT_INTERVAL_MS);
    this.timer = setInterval(() => {
      void this.tick();
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runNow() {
    return this.tick();
  }

  private async tick() {
    if (this.running) {
      return [];
    }

    this.running = true;
    try {
      return await this.rebalanceJobService.runScheduledChecks();
    } catch (error) {
      this.logger.error('Scheduler for rebalancing failed.', error instanceof Error ? error.stack : undefined);
      return [];
    } finally {
      this.running = false;
    }
  }
}
