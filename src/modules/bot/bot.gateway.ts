import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Keyboards } from './keyboards/keyboard';
import { KeyboardsTextEnum } from './enums/keyboard-text.enum';
import { ActionsEnum } from './enums/actions.enum';
import { UserService } from '../user/user.service';
import { SessionUser } from '../utils/decorators/user';
import { UserDto } from '../user/dto/user.dto';
import { GameService } from '../game/game.service';

@Update()
export class BotGateway {
  userTimeout = new Map();
  constructor(
    private readonly quizService: GameService,
    private readonly userService: UserService,
  ) {}

  @Start()
  async sayHello(@Ctx() ctx, @SessionUser() user: UserDto) {
    return this.userService.createUser(ctx, user);
  }

  @Action(/^answer:(.*)$/)
  async answer(@Ctx() ctx, @SessionUser() user: UserDto) {
    if (!this.userTimeout.get(user.id)) {
      this.userTimeout.set(user.id, true);
      const actionString = ctx.match[1];
      await ctx.deleteMessage();
      setTimeout(() => {
        this.userTimeout.delete(user.id);
      }, 3000);
      return this.quizService.answer(user, actionString);
    }
    return 'Нельза изменить ответ!';
  }

  @Command(ActionsEnum.JOIN)
  @Hears(KeyboardsTextEnum.JOIN)
  async analyzeScene(@Ctx() ctx) {
    ctx.session.type = ActionsEnum.JOIN;
    await ctx.reply('Укажите ID игры:', Keyboards.menuButtons());
  }
  @Command(ActionsEnum.BACK)
  @Hears(KeyboardsTextEnum.BACK)
  async back(@Ctx() ctx) {
    ctx.session.type = '';
    await ctx.reply(
      'Добро пожаловать в GDSC KNU (BOT)!',
      Keyboards.startButtons(),
    );
  }
  @On('text')
  async handler(@Ctx() ctx, @SessionUser() user: UserDto) {
    if (!ctx.session.type) {
      await ctx.reply(
        'Добро пожаловать в GDSC KNU (BOT)!',
        Keyboards.startButtons(),
      );
      return;
    }

    switch (ctx.session.type) {
      case ActionsEnum.JOIN: {
        const gameId = ctx?.update?.message?.text;
        return this.userService.joinRoom(ctx, gameId, user);
      }
      case ActionsEnum.WAIT: {
        return 'Подождите...';
      }
    }
  }
}
