import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateQuizeDto } from './dto/create-quize.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: 'Get ranking' })
  @Get('rating/:id')
  getRating(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getRating(id);
  }

  @ApiOperation({ summary: 'Get game by id' })
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getGame(id);
  }

  @ApiOperation({ summary: 'Get game users' })
  @Get('users/:id')
  getGameUsers(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getGameUsers(id);
  }

  @ApiOperation({
    summary: 'Send question for users by gameId and questionId as quiz',
  })
  @Post('send/:gameId/:quiz')
  sendQuiz(
    @Param('gameId') gameId: number,
    @Param('quiz', ParseIntPipe) quizId: number,
  ) {
    return this.gameService.sendQuiz(gameId, quizId);
  }

  @ApiOperation({ summary: 'Long polling to check with gameId' })
  @Get('is-done/:id')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.getStatus(id);
  }

  @ApiOperation({ summary: 'Create game' })
  @Post()
  createRoom(@Body() payload: CreateGameDto) {
    return this.gameService.createGame(payload);
  }

  @ApiOperation({ summary: 'Create question for game' })
  @Post('quiz')
  create(@Body() createQuizeDto: CreateQuizeDto) {
    return this.gameService.create(createQuizeDto);
  }

  @ApiOperation({ summary: 'Start the game' })
  @Post('start/:id')
  start(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.startGame(id);
  }

  @ApiOperation({ summary: 'End the game' })
  @Post('end/:id')
  end(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.endGame(id);
  }

  @ApiOperation({ summary: 'Block game' })
  @Post('block/:id')
  block(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.block(id);
  }
}
