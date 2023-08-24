import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { ExcelService } from '../common/services/excel.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [BlockchainService, ExcelService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
