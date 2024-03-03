import { BadRequestException, Injectable } from '@nestjs/common';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';
import { UserInfoDto, UserLoadoutDto } from 'src/app.model';

const clubTacticoolUrl = `https://club.tacticool.game/user/<PANZER_ID>`;
const clubTacticoolLoadoutUrl = `https://club.tacticool.game/user/<PANZER_ID>/preset/<LOADOUT_NUM>`;

const fetchRenderedPageContent = async (url: string): Promise<string> => {
  // Launch a new browser session.
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    // executablePath:
    //   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
  });

  // Wait for the content to render (you might need to adjust this selector).
  await page.waitForSelector('#root');

  // Retrieve the entire page content after JavaScript execution.
  const content = await page.content();

  // Close the browser session.
  await browser.close();

  return content;
};

@Injectable()
export class AppService {
  async getValidateUser(user: string): Promise<UserInfoDto> {
    const curUserUrl = clubTacticoolUrl.replace('<PANZER_ID>', user);

    const pageContent = await fetchRenderedPageContent(curUserUrl);
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

    const pageContent = await fetchRenderedPageContent(curLoadoutUrl);
    console.log(pageContent);
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
}
