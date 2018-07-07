import {Screen, ScreenManager, LudicApp} from 'ludic'
import {World} from 'ludic-box2d'

import LobbyScreenUI from '$ui/LobbyScreen'

export default class LobbyScreen extends Screen {
  private teamsEnabled: boolean
  private lobbyScreen!: LobbyScreenUI
  
  constructor(teamsEnabled: boolean) {
    super()
    this.teamsEnabled = teamsEnabled
  }

  public onAddedToManager(manager: ScreenManager) {
    this.lobbyScreen = this.$mapMethods(new LobbyScreenUI({teamsEnabled: this.teamsEnabled}), {
      onReady: 'onReady',
    })
    console.log(this)
    // this.$app.$ui.$refs.lobby = this.lobbyScreen
  }

  public onReady([component, data]: [LobbyScreenUI, {players: Array<{ready: boolean}>}]) {
    data.players = data.players.filter((p) => p.ready)
    this.finish(data)
  }
  public onDestroy() {
    delete this.$app.$ui.$refs.lobby
  }

  public update(delta: number) {
    this.$app.$input.update()
    this.$app.$canvas.clear('black')
  }
}
