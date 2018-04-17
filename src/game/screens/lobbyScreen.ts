import {Screen} from 'ludic'
import {World} from 'ludic-box2d'

import LobbyScreenUI from '$ui/LobbyScreen'

export default class LobbyScreen extends Screen {
  constructor(teamsEnabled) {
    super()
    this.teamsEnabled = teamsEnabled
  }

  public onAddedToManager(manager) {
    this.lobbyScreen = this.$mapMethods(new LobbyScreenUI({teamsEnabled: this.teamsEnabled}), {
      onReady: 'onReady',
    })
    console.log(this)
    // this.$app.$ui.$refs.lobby = this.lobbyScreen
  }

  public onReady([component, data]) {
    data.players = data.players.filter((p) => p.ready)
    this.finish(data)
  }
  public onDestroy() {
    delete this.$app.$ui.$refs.lobby
  }

  public update(time, delta) {
    let ctx = this.$app.$context
    this.$app.$input.update()
    this.$app.$canvas.clear('black')
  }
}
