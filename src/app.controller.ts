import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UserInfoDto, UserLoadoutDto } from 'src/app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Accepts 0, 1 or 2 as loadout
  // User is the Panzer ID
  @Get('user/loadout')
  getUserLoadout(
    @Body() { user, loadout }: { user: string; loadout: number },
  ): Promise<UserLoadoutDto> {
    return this.appService.getUserLoadout(user, loadout);
  }

  // User is the Panzer ID
  @Get('user/validate')
  getValidateUser(@Body() user: string): Promise<UserInfoDto> {
    return this.appService.getValidateUser(user);
  }
}
