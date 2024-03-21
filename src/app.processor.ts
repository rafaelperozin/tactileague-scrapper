import { Process, Processor } from '@nestjs/bull';
import { HttpException } from '@nestjs/common';
import { Job } from 'bull';
import { UserInfoDto } from 'src/app.model';
import { AppService } from 'src/app.service';

@Processor('scrapeQueue')
export class ScrapeProcessor {
  constructor(private appService: AppService) {}

  @Process('validateUser')
  async handleValidateUser(job: Job): Promise<UserInfoDto> {
    const { user } = job.data;
    try {
      console.log('running a request for user validation: ', user);
      return await this.appService.getValidateUser(user);
    } catch (e) {
      throw new HttpException('Failed to validate user: ' + e.message, 500);
    }
  }

  @Process('userLoadout')
  async handleUserLoadout(job: Job): Promise<any> {
    const { user, loadout } = job.data;
    try {
      console.log('running a request for user loadout: ', user);
      return await this.appService.getUserLoadout(user, loadout);
    } catch (e) {
      throw new HttpException('Failed to get user loadout: ' + e.message, 500);
    }
  }
}
