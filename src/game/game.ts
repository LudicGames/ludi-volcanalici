import { LudicApp, ScreenManager } from 'ludic'
import LobbyScreen from '@/game/screens/lobbyScreen'

export default class GameApp extends LudicApp {
  public screenManager: ScreenManager

  constructor(config: object = {}) {
    super(config)
    this.screenManager = new ScreenManager(this)
    this.screenManager.addScreenEventListener(this)
    this.screenManager.addScreen(new LobbyScreen())
  }
  public onScreenFinished(screen, manager, data) {

  }
  public update(...args: any[]): void {
    this.screenManager.update(...args)
  }
}
