import { BadRequestException, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { load } from 'cheerio';
import { InjectQueue } from '@nestjs/bull';
import puppeteer from 'puppeteer';
import { UserInfoDto, UserLoadoutDto } from 'src/app.model';

const clubTacticoolUrl = `https://club.tacticool.game/user/<PANZER_ID>`;
const clubTacticoolLoadoutUrl = `https://club.tacticool.game/user/<PANZER_ID>/preset/<LOADOUT_NUM>`;

@Injectable()
export class AppService {
  constructor(@InjectQueue('scrapeQueue') private queue: Queue) {}

  async validateUserQueue(user: string): Promise<Job<UserInfoDto>> {
    const job: Job = await this.queue.add('validateUser', { user });
    await job.finished();
    return job.returnvalue;
  }

  async userLoadoutQueue(
    user: string,
    loadout: number,
  ): Promise<Job<UserLoadoutDto>> {
    const job: Job = await this.queue.add('userLoadout', { user, loadout });
    await job.finished();
    return job.returnvalue;
  }

  async getValidateUser(user: string): Promise<UserInfoDto> {
    const curUserUrl = clubTacticoolUrl.replace('<PANZER_ID>', user);

    const pageContent = await this.fetchRenderedPageContent(curUserUrl);
    const $ = load(pageContent);

    const userNickname = $('.c-user-info__nickname').first().text().trim();
    if (!userNickname) throw new BadRequestException('Invalid user');

    const userClanTag = $('.c-user-info__clan-tag').first().text().trim();
    const userClanName = $('.c-user-info__clan-name').first().text().trim();
    const userLevel = $('.c-user-info__level-number').first().text().trim();

    return {
      nickname: userNickname,
      clanTag: userClanTag,
      clanName: userClanName,
      userLevel: userLevel,
    };
  }

  async getUserLoadout(user: string, loadout: number): Promise<any> {
    const curLoadoutUrl = clubTacticoolLoadoutUrl
      .replace('<PANZER_ID>', user)
      .replace('<LOADOUT_NUM>', loadout.toString());

    const pageContent = await this.fetchRenderedPageContent(curLoadoutUrl);
    const $ = load(pageContent);

    const weapons: UserLoadoutDto = {
      primaryWeapon: '',
      secondaryWeapon: '',
      specialWeapon: '',
      superWeapon: '',
    };

    const weaponsContainer = $('.c-weapon');

    if (weaponsContainer.length === 0)
      throw new BadRequestException('Invalid user or loadout number.');

    $('.c-weapon').each((index, element) => {
      const weaponType = $(element).find('.c-weapon__type').text().trim();
      const weaponName = $(element).find('.c-weapon__name').text().trim();

      switch (weaponType) {
        case 'Primary weapon':
          weapons.primaryWeapon = weaponName;
          break;
        case 'Secondary weapon':
          weapons.secondaryWeapon = weaponName;
          break;
        case 'Special':
          weapons.specialWeapon = weaponName;
          break;
        case 'SUPER WEAPON':
          weapons.superWeapon = weaponName;
          break;
      }
    });

    return weapons;
  }

  async fetchRenderedPageContent(url: string): Promise<string> {
    // Launch a new browser session.
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      // TODO: Comment out the executablePath before deploying.
      // executablePath:
      //   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // only when running on local mac machine
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    // Open a new page.
    const page = await browser.newPage();

    // Navigate to the URL.
    await page.goto(url, {
      waitUntil: 'networkidle0', // Wait for the network to be idle (no ongoing requests).
      timeout: 60000, // Set timeout to 60 seconds.
    });

    // Wait for the content to render (you might need to adjust this selector).
    await page.waitForSelector('#root', { timeout: 60000 });

    // Retrieve the entire page content after JavaScript execution.
    const content = await page.content();

    // Close the browser session.
    await browser.close();

    return content;
  }
}
