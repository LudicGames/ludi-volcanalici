import {BaseEntity} from 'ein'
import {Box2D} from 'ludic-box2d'
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

interface Opts {
  x: number
  y: number
  width: number
  height: number
  color: string | CanvasGradient | CanvasPattern
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
  public color: string | CanvasGradient | CanvasPattern
  public startColor: string | CanvasGradient | CanvasPattern
  public gamepadIndex?: number | null
  public body: any
  public movementListener?: InputEventListener
  public boostCharge: number = 0
  public boosting: boolean = false
  public jumping: boolean = false
  public jumpValue: number = 27
  public moveValue: number = 20
  public airborneMoveValue: number = 15
  public movingDirection: PlayerDirection = PlayerDirection.NONE
  public airborne: boolean = false
  protected x: number
  protected y: number
  private isDynamic: boolean

  constructor(xOrOptions: number | object, y = DEFS.y, width = DEFS.width,
              height = DEFS.height, color = DEFS.color, world: any = null) {
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
    this.createB2D(world)
  }

  public createB2D(world: any){
    const bd = new Box2D.b2BodyDef()
    if(this.isDynamic){
      bd.set_type(Box2D.b2_dynamicBody)
    }
    bd.set_position(new Box2D.b2Vec2(this.x, this.y))
    this.body = world.CreateBody(bd)
    this.body.SetFixedRotation(true)

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    const fixture = this.body.CreateFixture(shape, 0.0)
    fixture.SetUserData(1)
    fixture.SetDensity(1.5)
    this.body.SetUserData({entity: this})


    // var md = new Box2D.b2MassData()
    // md.set_mass(0.0)
    // md.set_center(new Box2D.b2Vec2(0,0))
    // md.set_I(0)

    // this.body.SetMassData(md)
    this.body.ResetMassData()

    // create a contact listener for contact with platforms 
    this.platformContactListener = world.newBodyContactListener(this.body, this.onPlatformContact.bind(this))
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
  
  private onPlatformContact(begin, contactBody){
    const {entity, position} = contactBody.GetUserData()
    if(entity.constructor.name === 'Platform'){
      this.airborne = !begin
    } else if(entity.constructor.name == 'Walls'){
      this.airborne = position === 'bottom' ? !begin : this.airborne
    }
  }
  
}
