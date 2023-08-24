import { Markup } from 'telegraf';
import { ActionsEnum } from '../enums/actions.enum';
import { KeyboardsTextEnum } from '../enums/keyboard-text.enum';

export class Keyboards {
  static startButtons() {
    return Markup.keyboard(
      [
        Markup.button.callback(KeyboardsTextEnum.USER, ActionsEnum.USER),
        Markup.button.callback(
          KeyboardsTextEnum.ANALYTIC,
          ActionsEnum.ANALYTIC,
        ),
      ],
      {
        columns: 2,
      },
    ).resize(true);
  }
  static menuButtons() {
    return Markup.keyboard(
      [
        Markup.button.callback(KeyboardsTextEnum.HELP, ActionsEnum.HELP),
        Markup.button.callback(KeyboardsTextEnum.ANALYZE, ActionsEnum.ANALYZE),
      ],
      {
        columns: 2,
      },
    ).resize(true);
  }

  static backButton() {
    return Markup.keyboard(
      [Markup.button.callback(KeyboardsTextEnum.BACK, ActionsEnum.HELP)],
      {
        columns: 1,
      },
    ).resize(true);
  }
}
