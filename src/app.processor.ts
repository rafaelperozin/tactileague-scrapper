import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UserInfoDto, UserLoadoutDto } from 'src/app.model';
import { AppService } from 'src/app.service';

@Processor('scrapeQueue')
export class ScrapeProcessor {
  constructor(private appService: AppService) {}

  @Process('validateUser')
  async handleValidateUser(job: Job): Promise<UserInfoDto> {
    const { user } = job.data;
    console.log('running a request for user validation: ', user);

    const result = await this.appService.getValidateUser(user);
    return result;
  }

  @Process('userLoadout')
  async handleUserLoadout(job: Job): Promise<UserLoadoutDto> {
    const { user, loadout } = job.data;
    console.log('running a request for user loadout: ', user);

    const result = await this.appService.getUserLoadout(user, loadout);
    return result;
  }
}
