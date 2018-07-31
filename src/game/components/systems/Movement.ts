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
export default class MovementSystem extends BaseSystem {
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
        up: this.jump(entity),
        down: this.crouch(entity),
        // up: this.moveEntity('y', entity, this.maxVY, 's'),
        // down: this.moveEntity('y', entity, -this.maxVY, 'w'),
        // r1: this.rotateEntity(entity, true),

        l1: this.dodge(entity),

        cross: this.jump(entity),

        rightStick: this.aim(entity),
        leftStick: this.moveStick(entity),
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

  private moveStick(player: Player){
    const vec = new Box2D.b2Vec2(0,0)
    const dz = 0.12
    return (x: number, y: number, e: any) => {
      // -x:left, -y:up

      if(Math.abs(x) > dz || Math.abs(y) > dz){
        if(Math.abs(x) > dz){
          player.movingDirection = x < 0 ? PlayerDirection.LEFT : PlayerDirection.RIGHT
          player.facingDirection = player.movingDirection
        } else {
          player.movingDirection = PlayerDirection.NONE
        }
        // if(Math.abs(y) > dz){
        //   axisPoint.y = -y
        // } else {
        //   axisPoint.y = 0
        // }
      } else if(e.zeroed) {
        player.movingDirection = PlayerDirection.NONE
      }
      this._moveEntity(player, vec)
    }
  }

  private _moveEntity(player: Player, vec: Box2D.b2Vec2){
    const vel = player.body.GetLinearVelocity()
    const desiredVel = player.movingDirection * player.moveMultiplier
    const velChange = desiredVel - vel.x
    vec.x = player.body.GetMass() * velChange

    // if we are pushing up against a wall, we should apply a downward force
    // as well to avoid it 'sticking' to the wall and create a slide effect
    if(player.walling && !player.phasing){
      const slideVel = player.wallSlideFactor
      const slideVelDiff = slideVel - vel.y
      vec.y = player.body.GetMass() * slideVelDiff
    } else {
      vec.y = 0
    }

    if(player.jumping && player.jumpCycles < 10 && player.walling){
      return
    }
    if(player.dodging){
      return
    }

    player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
  }

  private moveEntity(player: Player, dir: string){
    const vec = new Box2D.b2Vec2(0,0)
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        player.movingDirection = dir === 'left' ? PlayerDirection.LEFT : PlayerDirection.RIGHT
        player.facingDirection = player.movingDirection
      } else {
        player.movingDirection = 0
      }
      this._moveEntity(player, vec)
    }
  }

  private jump(player: Player){
    const vec = new Box2D.b2Vec2(0,0)
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        if((!player.airborne || (player.walling && !player.phasing)) && !player.jumping){
          player.jumping = true
          vec.y = player.body.GetMass() * player.jumpMultiplier
          
          if(player.walling && player.airborne){
            vec.x = (-1 * player.facingDirection) * (player.body.GetMass() * 2)
          } else {
            vec.x = 0
          }

          player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
        }
        // cap jump cycles to max
        if(player.jumpCycles < player.maxJumpCycles){
          player.jumpCycles++
        }
      } else {
        // when we let go of the button and the player is jumping, until the start falling,
        // we want to give the player a nudge downward to create variable jump heights
        if((player.airborne || player.jumpCycles === 1) && player.jumping && !player.falling){
          vec.y = -1 * (player.maxJumpCycles - player.jumpCycles)
          player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
        }
        player.jumping = false
        player.jumpCycles = 0
      }


    }
  }

  private crouch(player: Player){
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        if(!player.crouching){
          player.crouching = true
        }
      } else {
        player.crouching = false
      }
    }
  }

  private dodge(player: Player){
    const vec = new Box2D.b2Vec2(0,0)
    let dodgingEngaged = false
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        if(!player.dodging && player.dodgingEnabled && !dodgingEngaged){
          dodgingEngaged = true
          player.dodging = true
          vec.x = player.facingDirection * player.body.GetMass() * player.dodgingFactor
          player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
          setTimeout(() => {
            let vel = player.body.GetLinearVelocity()
            if(Math.ceil(vel.x) !== 0){
              vec.x = vec.x * -1
              player.body.ApplyLinearImpulse(vec, player.body.GetWorldCenter(), true)
            }
            player.dodging = false
            if(player.dodgingTimoutEnabled){
              // create a timeout where the player cannot dodge again
              player.dodgingEnabled = false
              setTimeout(() => {
                player.dodgingEnabled = true
              }, player.dodgingTimoutFactor)
            }
          }, player.dodgingDuration)
        }  
      } else {
        dodgingEngaged = false
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
