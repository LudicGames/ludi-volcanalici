import {BaseSystem, BaseEntity } from 'ein'
// import Ludic from 'Ludic'
import {Box2D} from 'ludic-box2d'
import { LudicApp, InputEventListenerOptions, InputEventListener } from 'ludic'
import Player from 'game/components/entities/Player'

const DEGTORAD = Math.PI / 180

interface EntityListenerMap {
  entity: Player
  id: number
  listener: InputEventListener
}
export default class ShootSystem extends BaseSystem<Player> {
  public entityQuery: object
  private entityListenerMap: {[key: string]: EntityListenerMap}
  private $app: LudicApp

  constructor(app: LudicApp){
    super(true, -1)
    this.entityListenerMap = {}
    this.$app = app

    this.entityQuery = {
      class: 'Player',
    }
    this.entities = []
  }

  // Override
  public onEntityAdded(entity: Player){
    this.createListener(entity)
    this.entities.push(entity)
  }

  // Override
  public update(entity: Player){

  }


  // instance methods
  private createListener(entity: Player){
    const listenerConfig: InputEventListenerOptions = {
      keyConfig: {
        'w.once': 'up',
        'a.once': 'left',
        's.once': 'down',
        'd.once': 'right',
        'q.once': 'l1',
        'e.once': 'r1',
      },
      methods: {
        r1: this.shoot(entity),

        // rightStick: this.moveStick(entity, true),
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

  private shoot(entity: Player){
    return (keyDown: boolean, e: any) => {
      if(keyDown){
        entity.shoot()
      } else {

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
          const desiredAngle = Math.atan2(axisPoint.get_y(), axisPoint.get_x())

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
