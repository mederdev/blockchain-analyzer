import { Markup } from 'telegraf';
import { ActionsEnum } from '../enums/actions.enum';
import { KeyboardsTextEnum } from '../enums/keyboard-text.enum';

export class Keyboards {
  static startButtons() {
    return Markup.keyboard(
      [Markup.button.callback(KeyboardsTextEnum.JOIN, ActionsEnum.JOIN)],
      {
        columns: 1,
      },
    ).resize(true);
  }
  static menuButtons() {
    return Markup.keyboard(
      [Markup.button.callback(KeyboardsTextEnum.BACK, ActionsEnum.BACK)],
      {
        columns: 1,
      },
    ).resize(true);
  }
}
