import { Injectable } from '@nestjs/common';
import { Worksheet, Workbook } from 'exceljs';

@Injectable()
export class CommonService {
  async sendExcelFile(ctx, trades: any[]) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Торги');

    // Добавление заголовков
    worksheet.addRow([
      'Тикер монеты A',
      'Адрес контракта монеты A',
      'Тикер монеты B',
      'Адрес контракта монеты B',
      'Дата сделки',
      'Адрес контракта пула',
      'Тип декса',
    ]);

    for (const trade of trades) {
      worksheet.addRow([
        trade.pair?.token0?.symbol,
        trade.sender || '',
        trade.pair?.token1?.symbol,
        trade.to || '',
        new Date(Number(trade.timestamp * 1000)).toISOString(),
        trade.pair?.id,
        'Uniswap V2',
      ]);
    }

    this.autoFitColumnWidth(worksheet);
    const buffer = await workbook.xlsx.writeBuffer();
    await ctx.replyWithDocument(
      {
        source: buffer,
        filename: 'trades.xlsx',
      },
      {
        caption: `User's trades for all time`,
      },
    );
  }

  private autoFitColumnWidth(worksheet: Worksheet, minimalWidth = 10) {
    worksheet.columns.forEach((column) => {
      let maxColumnLength = 0;
      if (column && typeof column.eachCell === 'function') {
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxColumnLength = Math.max(
            maxColumnLength,
            minimalWidth,
            cell.value ? cell.value.toString().length : 0,
          );
        });
        column.width = maxColumnLength + 2;
      }
    });
  }
}
