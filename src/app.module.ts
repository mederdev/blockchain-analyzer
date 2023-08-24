import { Logger, Module } from '@nestjs/common';
import { BotModule } from './modules/bot/bot.module';
import { CommonService } from './modules/common/services/common.service';
import { CommonModule } from './modules/common/common.module';
import { Cron, ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [BotModule, CommonModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [CommonService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  constructor(private readonly commonService: CommonService) {}

  @Cron('0 0 23 * *')
  async handleCron() {
    this.logger.log('Cron job executed at', new Date());
    await this.commonService.updateLimits();
  }
}
