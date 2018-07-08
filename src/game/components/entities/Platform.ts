import {BaseEntity} from 'ein'
import {Box2D} from 'ludic-box2d'

export default class Platform extends BaseEntity {
  public width: number
  public height: number
  public color: string | CanvasGradient | CanvasPattern
  protected x: number
  protected y: number
  public body: any
  public fixture: any

  constructor(x: number, y: number, width: number, height: number, world: any, color: string= 'orange'){
    super(true, -1)
    this.width = width
    this.height = height
    this.world = world
    this.color = color
    this.x = x
    this.y = y

    if(world == null){
      throw new Error('Player needs a world for init.')
    }
    this.createB2D()
  }

  public createB2D(){
    const bd = new Box2D.b2BodyDef()
    bd.set_position(new Box2D.b2Vec2(this.x, this.y))
    this.body = this.world.CreateBody(bd)

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    this.fixture = this.body.CreateFixture(shape, 0.0)
    this.fixture.SetDensity(1.0)
    this.fixture.SetUserData(2)
    this.body.ResetMassData()
  }

  public shouldCollide(me, them){
    let my_pos = me.GetBody().GetPosition()
    let player_pos = them.GetBody().GetPosition()
    if(player_pos.get_y() < my_pos.get_y()){
      return false
    } else {
      return true
    }
  }

  public draw(ctx: CanvasRenderingContext2D){
    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
    ctx.restore()
  }
}
