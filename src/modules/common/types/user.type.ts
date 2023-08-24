import { RolesEnum } from '../enums/roles.enum';

export class User {
  id: string;

  type: RolesEnum;

  limit: number;
  constructor(data = {}) {
    Object.assign(this, data);
  }
}
