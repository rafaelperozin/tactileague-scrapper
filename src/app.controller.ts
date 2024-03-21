import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserInfoDto, UserLoadoutDto } from 'src/app.model';
import { Job } from 'bull';
import { UserLodoutDto } from 'src/app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Accepts 0, 1 or 2 as loadout
  // User is the Panzer ID
  @Get('user/loadout')
  getUserLoadout(
    @Body() { user, loadout }: UserLodoutDto,
  ): Promise<Job<UserLoadoutDto>> {
    console.log('user loadout request received: ', user, loadout);
    return this.appService.userLoadoutQueue(user, loadout);
  }

  // User is the Panzer ID
  @Get('user/validate')
  getValidateUser(
    @Body() { user }: Omit<UserLodoutDto, 'loadout'>,
  ): Promise<Job<UserInfoDto>> {
    console.log('user validation request received: ', user);
    return this.appService.validateUserQueue(user);
  }
}
