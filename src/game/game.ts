import { LudicApp, ScreenManager } from 'ludic'

export default class GameApp extends LudicApp {
  public screenManager: ScreenManager

  constructor(config: object = {}) {
    super(config)

    this.screenManager = new ScreenManager(this)
  }

  public update(...args: any[]): void {
    this.screenManager.update(...args)
  }
}
