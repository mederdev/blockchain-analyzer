import { Injectable } from '@nestjs/common'
import { Keyboards } from '../bot/keyboards/keyboard';
import { CommonService } from '../common/services/common.service';
import { UserDto } from './dto/user.dto';
import { GameService } from '../game/game.service';

@Injectable()
export class UserService {
  constructor(
    private readonly gameService: GameService,
    private readonly commonService: CommonService,
  ) {}
  async createUser(ctx, userPayload: UserDto) {
    const user = await this.commonService.get(userPayload.id.toString());

    await this.commonService.set(userPayload.id.toString(), {
      id: user.id,
      name: user.first_name,
      point: 0,
    });

    await ctx.reply(
      `Добро пожаловать в викторину ${userPayload.first_name}`,
      Keyboards.startButtons(),
    );
  }

  async getUser(id: string) {
    return this.commonService.get(id);
  }

  async joinRoom(ctx, id: string, user: UserDto) {
    return this.gameService.joinUserToRoom(ctx, id, user);
  }
}
