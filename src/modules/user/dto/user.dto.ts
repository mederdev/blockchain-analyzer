import { RolesEnum } from '../../common/enums/roles.enum';

export class UserDto {
  id: string;
  type: RolesEnum;
  limit: number;
}
