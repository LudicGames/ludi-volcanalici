import {BaseEntity} from 'ein'
import {Box2D} from 'ludic-box2d'
import Player from '$entities/Player'
import Box2DEntity from '$entities/Box2DEntity'
import * as CategoryBits from '$entities/CategoryBits'

export default class Platform extends Box2DEntity {
  public width: number
  public height: number
  public body!: Box2D.b2Body
  public fixture!: Box2D.b2Fixture
  public color: string | CanvasGradient | CanvasPattern
  protected x: number
  protected y: number

  constructor(x: number, y: number, width: number, height: number, world: any, color: string= 'orange'){
    super(true, -1)
    this.width = width
    this.height = height
    this.color = color
    this.x = x
    this.y = y

    if(world == null){
      throw new Error('Platform needs a world for init.')
    }
    this.createB2D(world)
  }

  public createB2D(world: any){
    const bd = new Box2D.b2BodyDef()
    bd.position = new Box2D.b2Vec2(this.x, this.y)
    this.body = world.CreateBody(bd)

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    const fixtureDef = new Box2D.b2FixtureDef()
    fixtureDef.shape = shape
    fixtureDef.density = 0.0
    fixtureDef.filter.categoryBits = CategoryBits.PLATFORM
    fixtureDef.filter.maskBits = CategoryBits.PLAYER
    fixtureDef.userData = 2
    this.fixture = this.body.CreateFixture(fixtureDef)
    this.body.SetUserData({entity: this})
    this.body.ResetMassData()
  }

  public shouldCollide(me, them){
    const myPos = me.GetBody().GetPosition()
    const playerPos = them.GetBody().GetPosition()
    const entity = them.GetBody().entity
    if(entity instanceof Player){
      if((playerPos.y - (entity.height / 2)) < (myPos.y + (this.height / 2))){
        // console.log('should NOT collide', them == entity.mainFixture, them == entity.footSensor, them == entity.leftSensor, them == entity.rightSensor)
        // if the bottom of the player is below the top of the platform
        // they should not collide
        return false
      } else {
        // console.log('SHOULD collide', them == entity.mainFixture, them == entity.footSensor, them == entity.leftSensor, them == entity.rightSensor)
        return true
      }
    } else {
      return false
    }
    
  }

  public draw(ctx: CanvasRenderingContext2D){
    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
    ctx.restore()
  }
}
