import { Injectable } from '@nestjs/common';
import { RolesEnum } from '../common/enums/roles.enum';
import { v4 as uuid4 } from 'uuid';
import { Keyboards } from '../bot/keyboards/keyboard';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class UserService {
  constructor(private readonly commonService: CommonService) {}
  async createUser(ctx, type: RolesEnum) {
    const user = await this.commonService.getUser(ctx.session?.user?.id);
    if (user) {
      if (user.type !== type) {
        return `You have already chosen the ${user.type} role.`;
      } else {
        await ctx.reply(
          `Welcome to blockchain-analyzer`,
          Keyboards.menuButtons(),
        );
        return;
      }
    }

    const userId = uuid4();
    ctx.session.user = {
      id: userId,
    };

    await this.commonService.setUser(userId, {
      type,
      limit: this.commonService.getLimit(type),
    });

    await ctx.reply(
      `Welcome to blockchain-analyzer\nFor the ${type} role, the maximum number of requests per day is ${this.commonService.getLimit(
        type,
      )}`,
      Keyboards.menuButtons(),
    );
  }

  async getUser(id: string) {
    return this.commonService.getUser(id);
  }
}
