import { LudicApp, ScreenManager, LudicAppConfig, ScreenEventListener } from 'ludic'
// import LobbyScreen from '@/game/screens/LobbyScreen'
import GameScreen from '@/game/screens/GameScreen'

import {Engine} from 'ein'

export default class GameApp extends LudicApp {
  public screenManager: ScreenManager

  constructor(config: LudicAppConfig = {}) {
    super(config)
    this.screenManager = new ScreenManager(this)
    // this.screenManager.addScreenEventListener(this)

    this.screenManager.addScreen(new GameScreen())
  }

  public update(delta: number, time: number): void {
    this.screenManager.update(delta)
  }
}
