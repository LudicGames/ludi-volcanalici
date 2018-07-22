import { BaseEntity } from 'ein'
import { Box2D, World } from 'ludic-box2d'
import { InputEventListener } from 'ludic'
import DrawableEntity from '$entities/DrawableEntity'

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

export default class Player extends BaseEntity implements DrawableEntity {
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
  public jumpValue: number = 27
  public moveValue: number = 20
  public airborneMoveValue: number = 15
  public movingDirection: PlayerDirection = PlayerDirection.NONE
  public airborne: boolean = false
  public platformContactListener!: World.ContactListener
  public footFixture!: Box2D.b2Fixture
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

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    const fixture = this.body.CreateFixture(shape, 1.5)
    fixture.SetUserData(1)
    // fixture.SetDensity(1.5)
    this.body.SetUserData({entity: this})

    const footShape = new Box2D.b2PolygonShape()
    footShape.SetAsBox(this.width / 2.3, 0.2, new Box2D.b2Vec2(0, -this.height / 2), 0)
    this.footFixture = this.body.CreateFixture(footShape, 0.0)
    this.footFixture.SetSensor(true)

    // var md = new Box2D.b2MassData()
    // md.set_mass(0.0)
    // md.set_center(new Box2D.b2Vec2(0,0))
    // md.set_I(0)

    // this.body.SetMassData(md)
    this.body.ResetMassData()

    // create a contact listener for contact with platforms
    this.platformContactListener = new World.ContactListener(this.onPlatformContact.bind(this))
    world.registerBodyContactListener(this.platformContactListener)
  }

  get moveMultiplier(){
    return this.airborne ? this.airborneMoveValue : this.moveValue
  }

  get jumpMultiplier(){
    return this.jumpValue
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

  public grabGun(gun: any){
    this.guns.push(gun)
    this.currentGun = gun
    gun.owner = this

    // Join the Player and Gun bodies
    let jointDef = new Box2D.b2RevoluteJointDef()
    let axis = new Box2D.b2Vec2(0.0, 1.0)
    jointDef.Initialize(this.body, gun.body, gun.getPosition(), axis)
    jointDef.set_motorSpeed(10.0)
    jointDef.set_maxMotorTorque(20.0)
    jointDef.set_enableMotor(true)
    this.world.CreateJoint(jointDef)
  }

  public dropGun(){
    // TODO, remove joint from Player <-> Gun  bodies
  }

  public shoot(){
    console.log("Player.shoot()")
    if(this.currentGun){
      this.currentGun.fire()
    }
  }

  private onPlatformContact(begin: boolean, contact: Box2D.b2Contact){
    const fixtureA = contact.GetFixtureA()
    const fixtureB = contact.GetFixtureB()
    const fixture = this.footFixture === fixtureA ? fixtureB : this.footFixture === fixtureB ? fixtureA : null
    if(fixture){
      const {entity, position} = fixture.GetBody().GetUserData()
      if(entity.constructor.name === 'Platform'){
        this.airborne = !begin
      } else if(entity.constructor.name === 'Walls'){
        this.airborne = position === 'bottom' ? !begin : this.airborne
      }

    }
  }

}
