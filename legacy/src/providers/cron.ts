import { CronJob } from 'cron';
import { getTime } from '../utils/index.js';

export default class Cron {
  private cron: CronJob;

  constructor(
    private cronName: string,
    private cronTime: string,
    private task: () => void | Promise<void>,
  ) {
    this.cron = new CronJob(this.cronTime, async () => {
      this.startLog();
      await this.task();
      this.finishLog();
    });
  }

  private startLog(): void {
    console.log(`[${getTime()}] ${this.cronName} started.`);
  }

  private finishLog(): void {
    console.log(`[${getTime()}] ${this.cronName} finished.`);
  }

  public start(): void {
    this.cron.start();
  }
}
