import {
  Command,
  Ctx,
  Hears,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { Keyboards } from './keyboards/keyboard';
import { KeyboardsTextEnum } from './enums/keyboard-text.enum';
import { ActionsEnum } from './enums/actions.enum';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RolesEnum } from '../common/enums/roles.enum';
import { UserService } from '../user/user.service';
import { SessionUser } from '../utils/decorators/user';
import { UserDto } from '../user/dto/user.dto';

@Update()
export class BotGateway {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly blockChainService: BlockchainService,
    private readonly userService: UserService,
  ) {}

  @Start()
  async sayHello(@Ctx() ctx) {
    await ctx.reply(`Hello, choose your role:`, Keyboards.startButtons());
  }

  @Command(ActionsEnum.HELP)
  @Hears(KeyboardsTextEnum.HELP)
  async help(@SessionUser() user: UserDto) {
    const userInfo = await this.userService.getUser(user.id);
    return `
      ID: ${user.id},\nType: ${userInfo.type},\nLimit: ${userInfo.limit}\n\nAvailable commands:\n/start - bot start\n/help - bot help\n/analyze - starting trades analyze,
    `;
  }

  @Hears(KeyboardsTextEnum.USER)
  async asUser(@Ctx() ctx) {
    return this.userService.createUser(ctx, RolesEnum.USER);
  }

  @Hears(KeyboardsTextEnum.ANALYTIC)
  async asAnalytic(@Ctx() ctx) {
    return this.userService.createUser(ctx, RolesEnum.ANALYTIC);
  }

  @Command(ActionsEnum.ANALYZE)
  @Hears(KeyboardsTextEnum.ANALYZE)
  async analyzeScene(@Ctx() ctx) {
    ctx.session.type = ActionsEnum.ANALYZE;
    await ctx.reply(
      `Write the wallet address in the format: <id> eth`,
      Keyboards.backButton(),
    );
  }

  @Command(ActionsEnum.BACK)
  @Hears(KeyboardsTextEnum.BACK)
  async backScene(@Ctx() ctx) {
    ctx.session.type = '';
    await ctx.reply(`Main menu`, Keyboards.menuButtons());
  }
  @On('text')
  async handler(@Ctx() ctx, @SessionUser() user: UserDto) {
    if (!ctx.session.type) {
      await ctx.reply('Choose an action!');
      return;
    }

    switch (ctx.session.type) {
      case ActionsEnum.ANALYZE: {
        return this.blockChainService.getAnalyze(ctx, ctx.message.text, user);
      }
      default: {
        await ctx.reply('Wrong action!');
      }
    }
  }
}
