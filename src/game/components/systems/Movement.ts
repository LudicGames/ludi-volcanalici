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

        rightStick: this.aim(entity),
        // leftStick: this.moveStick(entity, false),
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

  private aim(entity: Player, right: boolean){
    const vec = new Box2D.b2Vec2(0,0)
    const axisPoint = new Box2D.b2Vec2(0,0)
    const dz = 0.12
    return (x: number, y: number, e: any) => {
      // -x:left, -y:up

      if(Math.abs(x) > dz || Math.abs(y) > dz){
        if(Math.abs(x) > dz){
          axisPoint.set_x(x)
        }
        if(Math.abs(y) > dz){
          axisPoint.set_y(-y)
        }

        const bodyAngle = entity.body.GetAngle()
        const desiredAngle = Math.atan2(axisPoint.get_y(), axisPoint.get_x())

        let gun = entity.currentGun
        if(gun){
          gun.body.SetTransform(gun.getPosition(), desiredAngle)
        }
      }
    }
  }

  private moveEntity(player: Player, dir: string){
    const vec = new Box2D.b2Vec2(0,0)
    let jumpCycles = 0
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        player.movingDirection = dir === 'left' ? PlayerDirection.LEFT : PlayerDirection.RIGHT
        player.facingDirection = player.movingDirection
      } else {
        player.movingDirection = 0
        jumpCycles = 0
      }

      const vel = player.body.GetLinearVelocity()
      const desiredVel = player.movingDirection * player.moveMultiplier
      const velChange = desiredVel - vel.x
      vec.x = player.body.GetMass() * velChange / e.delta // f = mv/t

      if(player.jumping){
        jumpCycles++
      } else {
        jumpCycles = 0
      }

      // if we are pushing up agains a wall, we should apply a downward force
      // as well to avoid it 'sticking' to the wall and create a slide effect
      if(player.walling && !player.phasing && jumpCycles !== 1){
        const slideVel = player.wallSlideFactor
        const slideVelDiff = slideVel - vel.y
        vec.y = player.body.GetMass() * slideVelDiff / e.delta
      } else {
        vec.y = 0
      }

      player.body.ApplyForce(vec, player.body.GetWorldCenter(), true)
    }
  }

  private jump(player: Player){
    const vec = new Box2D.b2Vec2(0,0)
    const maxJumpCycles = 20
    let jumpCycles = 0
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        if((!player.airborne || player.walling) && !player.jumping){
          // console.log('jump')
          player.jumping = true
          vec.y = player.body.GetMass() * player.jumpMultiplier

          if(player.walling){
            vec.x = (-1 * player.facingDirection) * vec.y
            // console.log('> ', 'walling', vec.x)
          } else {
            vec.x = 0
          }
          player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
        }
        // cap jump cycles to max
        if(jumpCycles < maxJumpCycles){
          jumpCycles++
        }
      } else {
        // when we let go of the button and the player is jumping, until the start falling,
        // we want to give the player a nudge downward to create variable jump heights
        if((player.airborne || jumpCycles === 1) && player.jumping && !player.falling){
          vec.y = -1 * (maxJumpCycles - jumpCycles)
          player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
        }
        player.jumping = false
        jumpCycles = 0
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

}
