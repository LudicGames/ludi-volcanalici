import { LudicApp, ScreenManager } from 'ludic'
import LobbyScreen from '@/game/screens/LobbyScreen'
import GameScreen from '@/game/screens/GameScreen'

export default class GameApp extends LudicApp {
  public screenManager: ScreenManager

  constructor(config: object = {}) {
    super(config)
    this.screenManager = new ScreenManager(this)
    this.screenManager.addScreenEventListener(this)

    this.screenManager.addScreen(new GameScreen())
  }

  public onScreenFinished(screen, manager, data) {

  }
  public update(...args: any[]): void {
    this.screenManager.update(...args)
  }
}
