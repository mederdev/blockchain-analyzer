import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuizeDto } from './dto/create-quize.dto';
import { CommonService } from '../common/services/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from '../../entities/game.entity';
import { Repository } from 'typeorm';
import { QuizeEntity } from '../../entities/quize.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { figureMapper } from '../../shared/constants/figure-mapper';
import { UserDto } from '../user/dto/user.dto';
import { ActionsEnum } from '../bot/enums/actions.enum';

@Injectable()
export class GameService {
  games = {};
  started = [];
  gameUsers = {};
  times = {};
  timeouts = {};
  answers = {};
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,
    @InjectRepository(QuizeEntity)
    private readonly quizRepo: Repository<QuizeEntity>,
    private readonly commonService: CommonService,
  ) {}
  async create(createQuizeDto: CreateQuizeDto) {
    const game = await this.gameRepo.findOneBy({ id: createQuizeDto.gameId });

    if (!game) {
      throw new NotFoundException('Game not found!');
    }

    const quiz = this.quizRepo.create({
      ...createQuizeDto,
      answers: JSON.stringify(createQuizeDto.answers),
    });

    return this.quizRepo.save(quiz);
  }

  async createGame(payload: CreateGameDto) {
    let game = await this.gameRepo.findOneBy({ uid: payload.uid });

    if (game) {
      throw new BadRequestException('Game with same uid already exist!');
    }

    game = this.gameRepo.create(payload);

    return this.gameRepo.save(game);
  }

  async getRating(id: number) {
    let game = await this.commonService.get(`game:${id}`);
    if (!game || true) {
      game = await this.getGame(id);
      await this.commonService.set(`game:${id}`, game);
    }

    const roomUsers = await this.commonService.getRoomUsersId(game?.uid);

    if (!roomUsers) return [];

    const users = await Promise.all(
      roomUsers.map(async (el) => this.commonService.get(el.toString())),
    );

    const ranking = users?.sort((a, b) => b.point - a.point);

    return ranking.slice(0, 5);
  }
  async getGameUsers(id: number) {
    let game = await this.commonService.get(`game:${id}`);
    if (!game || true) {
      game = await this.getGame(id);
      await this.commonService.set(`game:${id}`, game);
    }

    const roomUsers = await this.commonService.getRoomUsersId(game?.uid);

    if (!roomUsers) return [];

    const users = await Promise.all(
      roomUsers.map(async (el) => this.commonService.get(el.toString())),
    );

    return {
      users,
      count: users.length,
    };
  }
  async getGame(id: number) {
    return this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.quizes', 'quizes')
      .where({ id })
      .getOne();
  }
  async getStatus(id: number) {
    const game = await this.commonService.get(`game:${id}`);
    const roomUsers = await this.commonService.getRoomUsersId(game?.uid);
    return roomUsers?.length === this.answers[id]?.length;
  }

  async startGame(id: number) {
    let game = await this.commonService.get(`game:${id}`);
    if (!game || true) {
      game = await this.getGame(id);
      if (!game) {
        throw new NotFoundException('Game not found!');
      }
      await this.commonService.set(`game:${id}`, game);
    }

    const payload = {
      users: [],
    };

    await this.commonService.set(`room:${game.uid}`, payload);
    this.games[game.uid] = 0;
    return 'started';
  }

  async sendQuiz(gameId: number, quizId = 0) {
    let game = await this.commonService.get(`game:${gameId}`);
    if (!game || true) {
      game = await this.getGame(gameId);
      await this.commonService.set(`game:${gameId}`, game);
    }
    const quiz = game?.quizes.find((el) => el.id === quizId);

    if (!quiz && quizId !== 0) {
      throw new NotFoundException(`Quiz not found in game ${gameId}`);
    }

    const roomUsers = await this.commonService.getRoomUsersId(game?.uid);

    const queue = [];
    roomUsers.forEach((el) => {
      queue.push(
        this.sendMessageWithDeletion(
          +el,
          quizId === 0 ? this.getWelcomeStruct(game.title) : 'Выберите ответ:',
          this.getMessageStruct(quiz, gameId),
        ),
      );
    });

    await Promise.all(queue);
    if (quizId !== 0) {
      await this.commonService.set(`quiz:${quiz.gameId}`, quiz);
    }
    this.times[gameId] = Date.now();
    this.answers[gameId] = [];
  }

  async sendMessageWithDeletion(chatId, message, options) {
    const sentMessage = await this.bot.telegram.sendMessage(
      chatId,
      message,
      options,
    );
    this.timeouts[chatId] = setTimeout(async () => {
      try {
        if (this.timeouts[chatId]) {
          await this.bot.telegram.deleteMessage(chatId, sentMessage.message_id);
        }
      } catch (error) {
        console.error('Error while deleting message:', error);
      }
    }, 30000);
  }
  async answer(user: UserDto, answer: string) {
    const [gameId, figure] = answer.split(':');
    const quiz = await this.commonService.get(`quiz:${gameId}`);
    let userPoint = await this.commonService.get(user.id.toString());
    if (quiz.figure === figure) {
      const diff = Date.now() - this.times[gameId];
      const point = Math.floor(1000 - diff / 100);
      if (userPoint) {
        userPoint.point += point;
      } else {
        userPoint = {
          id: user.id,
          name: user.first_name,
          point: point,
        };
      }
    }
    await this.commonService.set(user.id.toString(), {
      point: userPoint.point,
      name: user.first_name,
      id: user.id,
    });
    if (this.timeouts[user.id]) {
      delete this.timeouts[user.id];
    }
    this.answers[gameId].push(user.id);
  }

  async block(id: number) {
    const game = await this.getGame(id);
    this.gameUsers[game.id] = await this.commonService.getRoomUsersId(
      game?.uid,
    );
    this.started.push(game.uid);
  }

  async joinUserToRoom(ctx, id: string, user: UserDto) {
    const room = await this.commonService.get(`room:${id}`);

    if (!room) {
      return 'Игра не найдена!';
    }

    ctx.session.type = ActionsEnum.WAIT;
    if (!room?.users.includes(user.id)) {
      room.users.push(user.id);
      await Promise.all([
        this.commonService.set(`room:${id}`, room),
        this.commonService.set(user.id.toString(), {
          id: user.id,
          point: 0,
          first_name: user.first_name,
        }),
      ]);
      return 'Вы в игре!\nЖелаем удачи.';
    }
    return 'Вы уже в игре!';
  }
  async endGame(gameId: number) {
    const game = await this.commonService.get(`game:${gameId}`);

    if (!game) {
      throw new BadRequestException('Already ended!');
    }

    await this.commonService.del(`game:${game.id}`);
    await this.commonService.del(`room:${game.uid}`);

    return 'ended';
  }
  getWelcomeStruct(title) {
    return `Добро пожаловть в quiz '${title}'`;
  }
  getMessageStruct(quiz, gameId) {
    try {
      const answers = JSON.parse(quiz.answers);
      const keyboard = [
        [
          Markup.button.callback(
            figureMapper[answers[0]?.figure],
            `answer:${gameId}:${answers[0].figure}`,
          ),
          Markup.button.callback(
            figureMapper[answers[1]?.figure],
            `answer:${gameId}:${answers[1].figure}`,
          ),
        ],
        [
          Markup.button.callback(
            figureMapper[answers[2]?.figure],
            `answer:${gameId}:${answers[2].figure}`,
          ),
          Markup.button.callback(
            figureMapper[answers[3]?.figure],
            `answer:${gameId}:${answers[3].figure}`,
          ),
        ],
      ];
      return {
        reply_markup: {
          inline_keyboard: keyboard,
          one_time_keyboard: true,
          remove_keyboard: true,
        },
      };
    } catch (err) {
      return {};
    }
  }
}
