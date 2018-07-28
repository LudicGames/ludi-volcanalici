import { BaseEntity } from 'ein'
import { Box2D, World } from 'ludic-box2d'
import { InputEventListener } from 'ludic'
import DrawableEntity from '$entities/DrawableEntity'
import Box2DEntity from '$entities/Box2DEntity'
import Gun from '$entities/Gun'
import Platform from '$entities/Platform'
import * as CategoryBits from '$entities/CategoryBits'

const DEFS: Opts = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  color: 'blue',
  isDynamic: true,
  gamepadIndex: null,
  world: null,
}

type Color = string | CanvasGradient | CanvasPattern

interface Opts {
  x: number
  y: number
  width: number
  height: number
  color: Color
  isDynamic: boolean
  gamepadIndex?: number | null
  world: any
}

export enum PlayerDirection {
  LEFT = -1,
  NONE = 0,
  RIGHT = 1,
}

export default class Player extends Box2DEntity implements DrawableEntity {
  public width: number
  public height: number
  public color: Color
  public startColor: Color
  public gamepadIndex?: number | null
  public body!: Box2D.b2Body
  public movementListener?: InputEventListener
  public boostCharge: number = 0
  public boosting: boolean = false
  public jumping: boolean = false
  public airborne: boolean = false
  public walling: boolean = false // determines whether the player is touching a wall
  public phasing: boolean = false
  public jumpFactor: number = 32
  public moveFactor: number = 20
  public airborneMoveFactor: number = 15
  public wallSlideFactor: number = -5
  public movingDirection: PlayerDirection = PlayerDirection.NONE
  public facingDirection: PlayerDirection = PlayerDirection.RIGHT
  public platformContactListener!: World.ContactListener
  public footSensor!: Box2D.b2Fixture
  public rightSensor!: Box2D.b2Fixture
  public leftSensor!: Box2D.b2Fixture
  public mainFixture!: Box2D.b2Fixture
  public currentGun: Gun = null
  public guns: array = []
  protected x: number
  protected y: number
  private isDynamic: boolean

  constructor(xOrOptions: number | object, y = DEFS.y, width = DEFS.width,
              height = DEFS.height, color = DEFS.color, world: World) {
    super(true, -1)
    if(typeof xOrOptions === 'object'){
      const opts: Opts = {...DEFS, ...xOrOptions}
      this.x = opts.x
      this.y = opts.y
      this.width = opts.width
      this.height = opts.height
      this.isDynamic = opts.isDynamic
      this.color = this.startColor = opts.color
      this.gamepadIndex = opts.gamepadIndex
      world = opts.world
    } else {
      this.x = xOrOptions
      this.y = y
      this.width = width
      this.height = height
      this.isDynamic = true
      this.color = this.startColor = color
    }
    if(world == null){
      throw new Error('Player needs a world for init.')
    }
    this.world = world
    this.createB2D(world)
  }

  public createB2D(world: World){
    const bd = new Box2D.b2BodyDef()
    if(this.isDynamic){
      bd.type = Box2D.b2BodyType.dynamic
    }
    bd.position = new Box2D.b2Vec2(this.x, this.y)
    this.body = world.CreateBody(bd)
    this.body.SetFixedRotation(true)
    // make the player feel gravity more so that jumps are less 'floaty'
    this.body.SetGravityScale(10)

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    const fixtureDef = new Box2D.b2FixtureDef()
    fixtureDef.shape = shape
    fixtureDef.density = 1.5
    fixtureDef.filter.categoryBits = CategoryBits.PLAYER
    fixtureDef.userData = 1
    this.mainFixture = this.body.CreateFixture(fixtureDef)
    this.body.SetUserData({entity: this})

    // Foot Sensor
    const footShape = new Box2D.b2PolygonShape()
    footShape.SetAsBox(this.width / 1.5, 0.2, new Box2D.b2Vec2(0, -this.height / 2), 0)
    const footFixtureDef = new Box2D.b2FixtureDef()
    footFixtureDef.shape = footShape
    footFixtureDef.density = 0.0
    footFixtureDef.filter.categoryBits = CategoryBits.PLAYER
    this.footSensor = this.body.CreateFixture(footFixtureDef)
    this.footSensor.SetSensor(true)
    
    // Wall Sensors
    const rightWallSensorShape = new Box2D.b2PolygonShape()
    rightWallSensorShape.SetAsBox(0.1, this.height / 2.3, new Box2D.b2Vec2(this.width / 2, 0), 0)
    const rightWallFixtureDef = new Box2D.b2FixtureDef()
    rightWallFixtureDef.shape = rightWallSensorShape
    rightWallFixtureDef.density = 0.0
    rightWallFixtureDef.filter.categoryBits = CategoryBits.PLAYER
    this.rightSensor = this.body.CreateFixture(rightWallFixtureDef)
    this.rightSensor.SetSensor(true)
    const leftWallSensorShape = new Box2D.b2PolygonShape()
    leftWallSensorShape.SetAsBox(0.1, this.height / 2.3, new Box2D.b2Vec2(-this.width / 2, 0), 0)
    const leftWallFixtureDef = new Box2D.b2FixtureDef()
    leftWallFixtureDef.shape = leftWallSensorShape
    leftWallFixtureDef.density = 0.0
    leftWallFixtureDef.filter.categoryBits = CategoryBits.PLAYER
    this.leftSensor = this.body.CreateFixture(leftWallFixtureDef)
    this.leftSensor.SetSensor(true)

    // var md = new Box2D.b2MassData()
    // md.set_mass(0.0)
    // md.set_center(new Box2D.b2Vec2(0,0))
    // md.set_I(0)

    // this.body.SetMassData(md)
    this.body.ResetMassData()

    // create a contact listener for contact with platforms
    this.platformContactListener = new World.ContactListener(this.onContact.bind(this))
    world.registerBodyContactListener(this.platformContactListener)
    // this.platformContactFilter = new World.ContactFilter(this.onFilter.bind(this))
    // world.addContactFilter(this.platformContactFilter)
  }

  get moveMultiplier(){
    return this.airborne ? this.airborneMoveFactor : this.moveFactor
  }

  get jumpMultiplier(){
    return this.jumpFactor
  }

  get falling(){
    // player is falling if their linear velocity downward is negative
    return Math.ceil(this.body.GetLinearVelocity().y) < 0
  }
  
  public getPosition() {
    return this.body.GetPosition()
  }

  public draw(ctx: CanvasRenderingContext2D){
    const pos = this.getPosition()
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.rotate(this.body.GetAngle())
    ctx.translate(-(pos.x), -(pos.y))
    ctx.fillStyle = this.color
    ctx.fillRect(pos.x - this.width / 2, pos.y - this.height / 2, this.width, this.height)
    ctx.restore()
  }

  public grabGun(gun: Gun){
    this.guns.push(gun)
    this.currentGun = gun
    gun.owner = this

    // make this gun not collide
    const filter = gun.fixture.GetFilterData()
    filter.maskBits &= ~CategoryBits.PLATFORM // clear platform from mask bits
    gun.fixture.SetFilterData(filter)



    // Join the Player and Gun bodies
    let jointDef = new Box2D.b2WeldJointDef()
    let axis = new Box2D.b2Vec2(0.0, 1.0)
    jointDef.Initialize(this.body, gun.body, gun.getPosition(), axis)
    this.gunJoint = this.world.CreateJoint(jointDef)
  }

  public dropGun(gun: Gun){
    // TODO, remove joint from Player <-> Gun  bodies
    // make this gun collide normally
    const filter = gun.fixture.GetFilterData()
    filter.maskBits |= CategoryBits.PLATFORM // set platform to mask bits
    gun.fixture.SetFilterData(filter)
  }

  public shoot(){
    if(this.currentGun){
      this.currentGun.fire()
    }
  }

  private checkFixtures(fixtureA: Box2D.b2Fixture, fixtureB: Box2D.b2Fixture, fixture: Box2D.b2Fixture): Box2D.b2Fixture | null {
    return fixture === fixtureA
      ? fixtureB
      : fixture === fixtureB
        ? fixtureA
        : null
  }

  // private onFilter(fixtureA, fixtureB){
  //   const fixture = this.checkFixtures(fixtureA, fixtureB, this.mainFixture)
  //   if(fixture){
  //     const entity = fixture.GetBody().entity
  //     if(entity instanceof Platform){
  //       const playerPos = this.body.GetPosition()
  //       const platformPos = this.body.GetPosition()
  //       console.log('on filter')
  //       if((playerPos.y - (this.height / 2)) < (platformPos.y + (entity.height / 2))){
  //         return false
  //       } else {
  //         return true
  //       }
  //     }
  //   }
  // }

  private checkContact(contact: Box2D.b2Contact, fixture: Box2D.b2Fixture): Box2D.b2Fixture | null {
    return this.checkFixtures(contact.GetFixtureA(), contact.GetFixtureB(), fixture)
  }

  private onContact(begin: boolean, contact: Box2D.b2Contact){
    if(this.checkContact(contact, this.rightSensor)){
      this.onWallSensorContact(begin, contact, this.rightSensor)
    } else if(this.checkContact(contact, this.leftSensor)){
      this.onWallSensorContact(begin, contact, this.leftSensor)
    } else if(this.checkContact(contact, this.footSensor)){
      this.onFootSensorContact(begin, contact)
    } else if(this.checkContact(contact, this.mainFixture)){
      this.onMainContact(begin, contact)
    }
  }

  private onWallSensorContact(begin: boolean, contact: Box2D.b2Contact, sensor: Box2D.b2Fixture){
    const fixture = this.checkContact(contact, sensor)!
    const {entity, position} = fixture.GetBody().GetUserData()
    if(entity.constructor.name === 'Platform' || (entity.constructor.name === 'Walls' && (position === 'right' || position === 'left'))){
      // console.log('set walling', begin)
      this.walling = begin
    }
  }

  private onFootSensorContact(begin: boolean, contact: Box2D.b2Contact){
    const fixture = this.checkContact(contact, this.footSensor)!
    const {entity, position} = fixture.GetBody().GetUserData()
    if(entity.constructor.name === 'Platform'){
      this.airborne = !begin
    } else if(entity.constructor.name === 'Walls'){
      this.airborne = position === 'bottom' ? !begin : this.airborne
    }
  }

  private onMainContact(begin: boolean, contact: Box2D.b2Contact){
    const fixture = this.checkContact(contact, this.mainFixture)!
    const entity = fixture.GetBody().entity
    // console.log(entity)
    if(entity instanceof Platform){
      this.phasing = begin
      if(begin){
        const platformBody = fixture.GetBody()
    
        const numPoints = contact.GetManifold().pointCount
        const worldManifold = new Box2D.b2WorldManifold()
        contact.GetWorldManifold(worldManifold)

        // check if contact points are moving downward
        for(let i = 0; i < numPoints; i++){
            const pointVel = this.body.GetLinearVelocityFromWorldPoint( worldManifold.points[i] )
            if(pointVel.y < 0 ){
              return // point is moving down, leave contact solid and exit
            }
        }
        // no points are moving downward, contact should not be solid
        contact.SetEnabled(false)
      } else {
        contact.SetEnabled(true)
      }
    }
  }

}
