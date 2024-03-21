import { Process, Processor } from '@nestjs/bull';
import { HttpException } from '@nestjs/common';
import { Job } from 'bull';
import { AppService } from 'src/app.service';

@Processor('scrapeQueue')
export class ScrapeProcessor {
  constructor(private appService: AppService) {}

  @Process('validateUser')
  async handleValidateUser(job: Job, done: CallableFunction): Promise<void> {
    const { user } = job.data;
    try {
      console.log('running a request for user validation: ', user);
      const result = await this.appService.getValidateUser(user);
      done(null, result);
    } catch (e) {
      done(new HttpException('Failed to validate user: ' + e.message, 500));
    }
  }

  @Process('userLoadout')
  async handleUserLoadout(job: Job, done: CallableFunction): Promise<void> {
    const { user, loadout } = job.data;
    try {
      console.log('running a request for user loadout: ', user);
      const result = await this.appService.getUserLoadout(user, loadout);
      done(null, result);
    } catch (e) {
      done(new HttpException('Failed to get user loadout: ' + e.message, 500));
    }
  }
}
