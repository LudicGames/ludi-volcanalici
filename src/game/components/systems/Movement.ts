import {BaseSystem} from 'ein'
// import Ludic from 'Ludic'
import {Box2D} from 'ludic-box2d'

const DEGTORAD = Math.PI / 180

export default class MovementSystem extends BaseSystem {
  constructor(app){
    super(true, -1)
    this.entityListenerMap = {}
    this.$app = app

    // environment vars describing how players move
    this.maxVX = 25
    this.maxVY = 25
    this.maxRotation = 5

    this.entityQuery = {
      class: 'Player'
    }
    this.entities = []

    this.registerEvents()
  }

  registerEvents(){
    // register 'create new player' event
  }

  //Overide
  onEntityAdded(entity){
    this.createListener(entity)
    this.entities.push(entity)
  }

  onEntityRemoved(manager){}


  //Overide
  update(delta){

  }

  // instance methods
  createListener(entity){
    let listenerConfig = {
      keyConfig: {
        'w.once': 'up',
        'a.once': 'left',
        's.once': 'down',
        'd.once': 'right',
        'q.once': 'l1',
        'e.once': 'r1',
      },
      methods: {
        left: this.moveEntity('x', entity, -this.maxVX, 'd'),
        right: this.moveEntity('x', entity, this.maxVX, 'a'),
        up: this.moveEntity('y', entity, this.maxVY, 's'),
        down: this.moveEntity('y', entity, -this.maxVY, 'w'),
        r1: this.rotateEntity(entity, true),

        l1: this.rotateEntity(entity, false),
        cross: this.boost(entity),

        rightStick: this.moveStick(entity, true),
        leftStick: this.moveStick(entity, false)
      }
    }

    if(entity.hasOwnProperty('gamepadIndex')){
      listenerConfig.gamepadIndex = entity.gamepadIndex
    }

    this.entityListenerMap[entity._id] = {
      entity,
      id: entity._id,
      listener: this.$app.$input.newInputListener(listenerConfig, this, true)
    }

    entity.movementListener = this.entityListenerMap[entity._id].listener
  }

  moveEntity(axis, entity, max, oddKey){
    let vec = new Box2D.b2Vec2(0,0)
    let dirs = {
      y: {
        old: 'x',
        desired: 'y'
      },
      x: {
        old: 'y',
        desired: 'x'
      }
    }
    let dir = dirs[axis]

    return (keyDown, e)=>{
      let desiredVel
      if(keyDown){
        desiredVel = max
        // this.running = true
      } else if(e.type === 'gamepadButtonEvent' || !e.allKeys[oddKey]) {
        desiredVel = 0
        // this.running = false
      } else if(e.allKeys[oddKey]) {
        desiredVel = -max
      }
      // let vel = entity.body.GetLinearVelocity()
      // let velChange = desiredVel - vel.get_x()
      // let impulse = entity.body.GetMass() * velChange
      // console.log('move entity right', desiredVel, vel.get_x(), velChange, entity.body.GetMass(), impulse)
      // entity.body.ApplyForce(new Box2D.b2Vec2(0, impulse), entity.body.GetWorldCenter())
      let oldVel = entity.body.GetLinearVelocity()
      vec[`set_${dir.old}`](oldVel[`get_${dir.old}`]())
      vec[`set_${dir.desired}`](desiredVel)
      entity.body.SetLinearVelocity(vec)
    }
  }

  boost(entity){
    entity.boost_charge = 0
    entity.start_color = entity.color
    return (keyDown, e)=>{
      if(keyDown){
        entity.boost_charge++
        entity.color = darken(entity.color, -.02)
      } else {
        entity.color = entity.start_color
        let magnitude = 100 //entity.body.GetMass() * entity.boost_charge
        let vel = entity.body.GetLinearVelocity()

        // console.log(vel.get_x())
        // console.log(vel.get_y())

        let x = vel.get_x() * 10
        let y = vel.get_y() * 10

        x = 0
        y = 400
        console.log(x)
        console.log(y)

        entity.boosting = true

        // entity.body.ApplyLinearImpulse(new Box2D.b2Vec2(x, y), entity.body.GetWorldCenter())
        entity.body.ApplyLinearImpulse(new Box2D.b2Vec2(x, y), entity.body.GetWorldCenter())
        entity.boost_charge = 0
      }
    }


  }

  rotateEntity(entity, right){

    return (keyDown, e)=>{
      // console.log('on rotate: ', keyDown)
      if(keyDown){
        entity.body.SetAngularVelocity(right ? -this.maxRotation : this.maxRotation)
      } else {
        entity.body.SetAngularVelocity(0)
      }
    }
  }

  moveStick(entity, right){
    let vec = new Box2D.b2Vec2(0,0)
    let axisPoint = new Box2D.b2Vec2(0,0)
    let dz = 0.12
    return (x, y, e)=>{
      // -x:left, -y:up
      if(right){

        if(Math.abs(x) > dz || Math.abs(y) > dz){
          if(Math.abs(x) > dz){
            axisPoint.set_x(x)
          }
          if(Math.abs(y) > dz){
            axisPoint.set_y(-y)
          }


          let pos = entity.body.GetPosition()
          let bodyAngle = entity.body.GetAngle()
          let desiredAngle = Math.atan2(axisPoint.get_y(), axisPoint.get_x())

          let nextAngle = bodyAngle + entity.body.GetAngularVelocity() / 60.0
          let totalRotation = desiredAngle - nextAngle
          while ( totalRotation < -180 * DEGTORAD ) totalRotation += 360 * DEGTORAD
          while ( totalRotation >  180 * DEGTORAD ) totalRotation -= 360 * DEGTORAD
          let desiredAngularVelocity = totalRotation * 60
          let impulse = entity.body.GetInertia() * desiredAngularVelocity
          entity.body.ApplyAngularImpulse( impulse , true)
        } else {
          entity.body.SetAngularVelocity(0)
        }
      } else {
        if(!e.axis.zeroed){
          vec.set_x(x*this.maxVX)
          vec.set_y(y*-this.maxVY)
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
function darken(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
