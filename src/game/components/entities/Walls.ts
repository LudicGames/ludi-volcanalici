import {Box2D} from 'ludic-box2d'
import {BaseEntity} from 'ein'

export default class Walls extends BaseEntity {
  public width: number
  public height: number
  public world: any
  public color: string
  public padding: number
  public size: number

  constructor(width: number, height: number, world: any, color: string= 'orange',
              padding: number= 0, active: boolean= true, priority: number= -1){
    super(active, priority)
    this.width = width
    this.height = height
    this.world = world
    this.color = color
    this.padding = padding
    this.size = 1
    this.createB2D(world)
  }

  public createB2D(world: any){
    // Top
    const topBd = new Box2D.b2BodyDef()
    topBd.set_position(new Box2D.b2Vec2(0, (this.height / 2) - (this.padding + this.size / 2)))
    const topBody = world.CreateBody(topBd)

    const topShape = new Box2D.b2PolygonShape()
    topShape.SetAsBox(this.width / 2, this.size / 2)
    const topFixture = topBody.CreateFixture(topShape, 0.0)
    topFixture.SetDensity(1.0)
    topBody.ResetMassData()

    // Bottom
    const bottomBd = new Box2D.b2BodyDef()
    bottomBd.set_position(new Box2D.b2Vec2(0, (0 - this.height / 2) + (this.padding + this.size / 2)))
    const bottomBody = world.CreateBody(bottomBd)

    const bottomShape = new Box2D.b2PolygonShape()
    bottomShape.SetAsBox(this.width / 2, this.size / 2)
    const bottomFixture = bottomBody.CreateFixture(bottomShape, 0.0)
    bottomFixture.SetDensity(1.0)
    bottomBody.ResetMassData()

    // Left
    const leftBd = new Box2D.b2BodyDef()
    leftBd.set_position(new Box2D.b2Vec2(-this.width / 2 + (this.padding + this.size / 2), 0 ))
    const leftBody = world.CreateBody(leftBd)

    const leftShape = new Box2D.b2PolygonShape()
    leftShape.SetAsBox(this.size / 2, this.height / 2)
    const leftFixture = leftBody.CreateFixture(leftShape, 0.0)
    leftFixture.SetDensity(1.0)
    leftBody.ResetMassData()

    // Right
    const rightBd = new Box2D.b2BodyDef()
    rightBd.set_position(new Box2D.b2Vec2(this.width / 2 - (this.size / 2 + this.padding), 0 ))
    const rightBody = world.CreateBody(rightBd)

    const rightShape = new Box2D.b2PolygonShape()
    rightShape.SetAsBox(this.size / 2, this.height / 2)
    const rightFixture = rightBody.CreateFixture(rightShape, 0.0)
    rightFixture.SetDensity(1.0)
    rightBody.ResetMassData()

  }

  public draw(ctx: CanvasRenderingContext2D){
    // Top
    ctx.fillStyle = this.color
    ctx.fillRect(
      -this.width / 2 + this.padding,
      this.height / 2 - (this.size + this.padding),
      this.width - this.padding * 2,
      this.size,
    )

    // Bottom
    ctx.fillRect(
      -this.width / 2 + this.padding,
      -this.height / 2 + this.padding,
      this.width - this.padding * 2,
      this.size,
    )

    // left
    ctx.fillRect(
      -this.width / 2 + this.padding,
      -this.height / 2 + this.padding,
      this.size,
      this.height - (this.padding * 2),
    )

    // right
    ctx.fillRect(
      this.width / 2 - (this.size + this.padding),
      -this.height / 2 + this.padding,
      this.size,
      this.height - (this.padding * 2),
    )

  }
}
