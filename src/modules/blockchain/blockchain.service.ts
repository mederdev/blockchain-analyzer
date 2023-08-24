import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ExcelService } from '../common/services/excel.service';
import { UNISWAP_SUBGRAPH_URL } from '../common/constants/uniswap';
import { CommonService } from '../common/services/common.service';

@Injectable()
export class BlockchainService {
  constructor(
    private readonly excelService: ExcelService,
    private readonly commonService: CommonService,
  ) {}
  async getAnalyze(ctx, message, user) {
    try {
      const userInfo = await this.commonService.getUser(user.id);

      if (userInfo.limit === 0) {
        return `You've reached the request limit as ${userInfo.type}`;
      }
      userInfo.limit -= 1;

      await Promise.all([
        this.commonService.setUser(user.id, userInfo),
        ctx.reply('Please wait, processing!\nMaxTimeout: 30s'),
      ]);

      const address = this.getAddress(message);
      const api = new ethers.FetchRequest(UNISWAP_SUBGRAPH_URL);
      api.body = {
        query: this.getQueryString(address),
      };
      const response = await api.send();
      const trades = response.bodyJson.data.swaps;

      await this.excelService.sendExcelFile(ctx, trades);
    } catch (err) {
      return `[ERROR] ${err.message}`;
    }
  }
  private getAddress(message: string) {
    const [address, prefix] = message.split(' ');

    if (prefix !== 'eth') {
      throw new Error('Invalid input data\nExample: <wallet address> eth');
    }

    if (!address || !ethers.isAddress(address)) {
      throw new Error('Incorrect wallet address');
    }

    return address;
  }

  private getQueryString(address) {
    return `{
        swaps(where: { to: "${address}" }) {
            transaction {
                id
            }
            timestamp
            amount0In
            amount1In
            amount0Out
            amount1Out
            sender
            to
            pair {
              id
              token0 {
                 symbol
              }
              token1 {
                symbol
              }
          }
        }
    }`;
  }
}
