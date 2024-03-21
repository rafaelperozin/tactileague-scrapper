import { IsString, IsInt, Length, Min, Max, Matches } from 'class-validator';

export class UserLodoutDto {
  @IsString()
  @Length(7, 8)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'User must be alphanumeric and between 7 and 8 characters.',
  })
  user: string;

  @IsInt()
  @Min(0)
  @Max(2)
  loadout: number;
}
