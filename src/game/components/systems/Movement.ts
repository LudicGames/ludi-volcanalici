import {BaseSystem, BaseEntity } from 'ein'
// import Ludic from 'Ludic'
import {Box2D} from 'ludic-box2d'
import { LudicApp, InputEventListenerOptions, InputEventListener } from 'ludic'
import Player, { PlayerDirection } from 'game/components/entities/Player'

const DEGTORAD = Math.PI / 180

interface EntityListenerMap {
  entity: Player
  id: number
  listener: InputEventListener
}
export default class MovementSystem extends BaseSystem<Player> {
  public entityQuery: object
  private entityListenerMap: {[key: string]: EntityListenerMap}
  private $app: LudicApp
  private maxVX: number
  private maxVY: number
  private maxRotation: number

  constructor(app: LudicApp){
    super(true, -1)
    this.entityListenerMap = {}
    this.$app = app

    // environment vars describing how players move
    this.maxVX = 25
    this.maxVY = 25
    this.maxRotation = 5

    this.entityQuery = {
      class: 'Player',
    }
    this.entities = []

    this.registerEvents()
  }

  public registerEvents(){
    // register 'create new player' event
  }

  // Override
  public onEntityAdded(entity: Player){
    this.createListener(entity)
    this.entities.push(entity)
  }

  // instance methods
  private createListener(entity: Player){
    const listenerConfig: InputEventListenerOptions = {
      keyConfig: {
        // 'w.once': 'up',
        'a.once': 'left',
        // 's.once': 'down',
        'd.once': 'right',
        // 'q.once': 'l1',
        // 'e.once': 'r1',
        'space.once': 'cross',
      },
      methods: {
        left: this.moveEntity(entity, 'left'),
        right: this.moveEntity(entity, 'right'),
        // up: this.moveEntity('y', entity, this.maxVY, 's'),
        // down: this.moveEntity('y', entity, -this.maxVY, 'w'),
        // r1: this.rotateEntity(entity, true),

        // l1: this.rotateEntity(entity, false),
        cross: this.jump(entity),

        rightStick: this.moveStick(entity, true),
        leftStick: this.moveStick(entity, false),
      },
    }

    if(entity.hasOwnProperty('gamepadIndex')){
      listenerConfig.gamepadIndex = entity.gamepadIndex
    }

    this.entityListenerMap[entity._id] = {
      entity,
      id: entity._id,
      listener: this.$app.$input.newInputListener(listenerConfig, this, true),
    }

    entity.movementListener = this.entityListenerMap[entity._id].listener
  }

  private moveEntity(entity: Player, dir: string){
    const vec = new Box2D.b2Vec2(0,0)
    const totalMoveCycles = 4
    let moveCycles = totalMoveCycles
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        entity.movingDirection = dir === 'left' ? PlayerDirection.LEFT : PlayerDirection.RIGHT
      } else {
        moveCycles = totalMoveCycles
        entity.movingDirection = PlayerDirection.NONE
      }

      const vel = entity.body.GetLinearVelocity()
      const desiredVel = entity.movingDirection * entity.moveMultiplier
      const velChange = desiredVel - vel.x
      vec.x = entity.body.GetMass() * velChange / e.delta // f = mv/t
      entity.body.ApplyForce(vec, entity.body.GetWorldCenter(), true)
    }
  }

  private jump(entity: Player){
    const vec = new Box2D.b2Vec2(0,0)
    const totalJumpCycles = 7
    let jumpCycles = totalJumpCycles
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        if(!entity.airborne){
          entity.jumping = true
        }
      } else {
        // TODO: remove this when contact listeners are in place
        entity.jumping = false
        jumpCycles = totalJumpCycles
      }

      if(entity.jumping){
        if(jumpCycles >= 0){
          // spread this over total time steps
          vec.y = ((entity.body.GetMass() * entity.jumpMultiplier) / e.delta) / totalJumpCycles
          entity.body.ApplyForce(vec, entity.body.GetWorldCenter(), true)
          jumpCycles--
        }
      }
    }
  }

  private rotateEntity(entity: Player, right: boolean){

    return (keyDown: boolean, e: any) => {
      // console.log('on rotate: ', keyDown)
      if(keyDown){
        entity.body.SetAngularVelocity(right ? -this.maxRotation : this.maxRotation)
      } else {
        entity.body.SetAngularVelocity(0)
      }
    }
  }

  private moveStick(entity: Player, right: boolean){
    const vec = new Box2D.b2Vec2(0,0)
    const axisPoint = new Box2D.b2Vec2(0,0)
    const dz = 0.12
    return (x: number, y: number, e: any) => {
      // -x:left, -y:up
      if(right){

        if(Math.abs(x) > dz || Math.abs(y) > dz){
          if(Math.abs(x) > dz){
            axisPoint.set_x(x)
          }
          if(Math.abs(y) > dz){
            axisPoint.set_y(-y)
          }


          // let pos = entity.body.GetPosition()
          const bodyAngle = entity.body.GetAngle()
          const desiredAngle = Math.atan2(axisPoint.y, axisPoint.x)

          const nextAngle = bodyAngle + entity.body.GetAngularVelocity() / 60.0
          let totalRotation = desiredAngle - nextAngle
          while ( totalRotation < -180 * DEGTORAD ) {totalRotation += 360 * DEGTORAD}
          while ( totalRotation >  180 * DEGTORAD ) {totalRotation -= 360 * DEGTORAD}
          const desiredAngularVelocity = totalRotation * 60
          const impulse = entity.body.GetInertia() * desiredAngularVelocity
          entity.body.ApplyAngularImpulse( impulse , true)
        } else {
          entity.body.SetAngularVelocity(0)
        }
      } else {
        if(!e.axis.zeroed){
          vec.set_x(x * this.maxVX)
          vec.set_y(y * -this.maxVY)
        } else {
          vec.set_x(0)
          vec.set_y(0)
        }
        entity.body.SetLinearVelocity(vec)
      }
    }
  }
}


// TODO move this
function darken(hex: string | CanvasGradient | CanvasPattern, lum: number) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  lum = lum || 0

  // convert to decimal and change luminosity
  let rgb = '#'
  let c
  let i
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2,2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ('00' + c).substr(c.length)
  }
  return rgb
}
