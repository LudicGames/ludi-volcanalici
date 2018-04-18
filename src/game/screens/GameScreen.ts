import {Screen, Camera} from 'ludic'
import {DebugDraw, World} from 'ludic-box2d'
import {Engine, BaseSystem} from 'ein'

// UI
import Timer from '$ui/Timer'

// Entities
import Player from '$entities/Player'
import Walls from '$entities/Wall'

// Systems
import RenderSystem from '$systems/Render'
import MovementSystem from '$systems/Movement'

export default class GameScreen extends Screen {
  constructor(data) {
    super()
    this.players = data.players
    this.teams = data.teams
  }

  public onAddedToManager() {
    this.initWorld()
    this.initSystems()
    this.initEntities()
  }

  initWorld(){
    this.camera = new Camera(this.$app.$canvas)
    this.camera.centerWorldToCamera()

    this.world = new World(0,0)
    this.debugDraw = DebugDraw.newDebugger(this.$app.$canvas)
    // this.debugDraw.SetFlags(DebugDraw.e_shapeBit)
    // this.world.SetDebugDraw(this.debugDraw)

    this.engine = new Engine(this.$app)
  }

  initSystems(){
    // Clear
    this.clearSystem = new BaseSystem(true, -100, (delta)=>{
      this.$app.$canvas.clear('#0C141F')
    })
    this.engine.addSystem(this.clearSystem)

    // Camera
    this.cameraSystem = new BaseSystem(true, 5, (delta)=>{
      this.camera.draw(this.$app.$context)
      // this.camera.drawAxes(this.$app.$context)
    })
    this.engine.addSystem(this.cameraSystem)

    // Render
    this.renderSystem = new RenderSystem(this.$app.$context)
    this.engine.addSystem(this.renderSystem)

    // Input
    this.inputSystem = new BaseSystem(true, 1, ()=>{
      this.$app.$input.update()
    })
    this.engine.addSystem(this.inputSystem)

    // Movement
    this.movementSystem = new MovementSystem(this.$app)
    this.engine.addSystem(this.movementSystem)
  }

  initEntities(){
    // Walls
    this.walls = new Walls(this.camera.width / this.camera.ptm, this.camera.height/ this.camera.ptm, this.world, 'orange', -1)
    this.engine.addEntity(this.walls)

    // Players
    this.players.forEach((player, index)=>{
      player.entity = new Player({x: 0, y: 0, width: 1, height: 6, color: "green", world: this.world, gamepadIndex: index})
      this.engine.addEntity(player.entity)
    })
  }

  onDestroy(){

  }

  update(delta, time){
    this.world.step(delta)
    this.engine.update(delta, time)
    // this.world.drawDebug(true)
  }
}
