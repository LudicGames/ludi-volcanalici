import {Screen, Camera} from 'ludic'
import {DebugDraw, World} from 'ludic-box2d'
import {Engine, BaseSystem, BaseEntity} from 'ein'

// Entities
import Player from '$entities/Player'
import Gun from '$entities/Gun'
import Platform from '$entities/Platform'
import Walls from '$entities/Walls'
import DrawableEntity from '$entities/DrawableEntity'

// Systems
import RenderSystem from '$systems/Render'
import MovementSystem from '$systems/Movement'
import ContactSystem from '$systems/Contact'
import ShootSystem from '$systems/Shoot'

interface PlayerObject {
  entity: Player
}

export default class GameScreen extends Screen {
  public camera!: Camera
  public world!: World
  public debugDraw: DebugDraw
  public players: PlayerObject[]
  public teams: object[]
  public engine: Engine

  private clearSystem!: BaseSystem<BaseEntity>
  private cameraSystem!: BaseSystem<BaseEntity>
  private inputSystem!: BaseSystem<BaseEntity>
  private renderSystem!: BaseSystem<BaseEntity & DrawableEntity>
  private movementSystem!: BaseSystem<Player>
  private contactSystem!: BaseSystem<BaseEntity>
  private shootSystem!: BaseSystem<Player>

  private walls!: Walls
  private platform1!: Platform
  private platform2!: Platform
  private platform3!: Platform

  private drawDebug: boolean = true


  constructor(data = {} as {players: PlayerObject[], teams: object[]}) {
    super()
    this.players = data.players ? data.players : [{} as PlayerObject]
    this.teams = data.teams
    this.engine = new Engine()
  }

  public onAddedToManager() {
    this.initWorld()
    this.initSystems()
    this.initEntities()

    // create an input listener for debugging
    this.$app.$input.newInputListener({
      keyConfig: {
        // when 1 is pressed, toggle drawDebug
        '1.once': (keyDown: boolean) => {
          if(!keyDown){
            this.drawDebug = !this.drawDebug
          }
        },
      },
    }, true)
  }

  public initWorld() {
    this.camera = new Camera(this.$app.$canvas)
    this.camera.centerWorldToCamera()

    this.world = new World(0, -9.8)
    this.debugDraw = DebugDraw.newDebugger(this.$app.$canvas)
    this.debugDraw.SetFlags(DebugDraw.e_shapeBit)
    this.world.SetDebugDraw(this.debugDraw)

  }

  public initSystems() {
    // Clear
    this.clearSystem = new BaseSystem(true, -100, (delta) => {
      this.$app.$canvas.clear('#0C141F')
    })
    this.engine.addSystem(this.clearSystem)

    // Camera
    this.cameraSystem = new BaseSystem(true, 5, (delta) => {
      this.camera.draw(this.$app.$context)
      // this.camera.drawAxes(this.$app.$context)
    })
    this.engine.addSystem(this.cameraSystem)

    // Render
    this.renderSystem = new RenderSystem(this.$app.$context)
    this.engine.addSystem(this.renderSystem)

    // Physics System
    this.engine.addSystem(new BaseSystem(true, 2, (delta) => {
      this.world.step(delta)
    }))

    // const debugDrawSystem = new BaseSystem(true, 5, ()=>{
    //   this.world.drawDebug()
    // })
    // this.engine.addSystem(debugDrawSystem)

    // Input
    this.inputSystem = new BaseSystem(true, 1, (delta) => {
      this.$app.$input.update(delta)
    })
    this.engine.addSystem(this.inputSystem)

    // Movement
    this.movementSystem = new MovementSystem(this.$app)
    this.engine.addSystem(this.movementSystem)

    // Shoot
    this.shootSystem = new ShootSystem(this.$app)
    this.engine.addSystem(this.shootSystem)

    // Contact
    // this.contactSystem = new ContactSystem(this.world)
    // this.engine.addSystem(this.contactSystem)
  }

  public initEntities() {
    // Walls
    this.walls = new Walls(this.camera.width / this.camera.ptm, this.camera.height / this.camera.ptm, this.world, 'orange', 0)
    this.engine.addEntity(this.walls)

    // Platforms
    this.platform1 = new Platform(-8, -10, 9, .5, this.world, 'orange')
    this.platform2 = new Platform(8, -8.5, 9, .5, this.world, 'orange')
    this.platform3 = new Platform(0, -4.5, 9, .5, this.world, 'orange')

    this.engine.addEntity(this.platform1)
    this.engine.addEntity(this.platform2)
    this.engine.addEntity(this.platform3)

    // Players
    this.players.forEach((player, index) => {
      player.entity = new Player({x: 0, y: -9, width: .8, height: 2.5, color: 'green', world: this.world, gamepadIndex: index})
      let gun = new Gun(this.world, 0, -9, 0.7, .2, 'red')
      player.entity.grabGun(gun)

      this.engine.addEntity(player.entity)
      this.engine.addEntity(gun)
    })
  }

  public update(delta: number, time: number){
    this.engine.update(delta)
    if(this.drawDebug){
      this.world.drawDebug()
    }
  }
}
