import {Box2D, World} from 'ludic-box2d'
import {BaseEntity} from 'ein'
import DrawableEntity from '$entities/DrawableEntity'
import Box2DEntity from '$entities/Box2DEntity'

export default class Walls extends Box2DEntity implements DrawableEntity {
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

  public createB2D(world: World){
    // Top
    const topBd = new Box2D.b2BodyDef()
    topBd.position = new Box2D.b2Vec2(0, (this.height / 2) - (this.padding + this.size / 2))
    const topBody = world.CreateBody(topBd)
    topBody.SetUserData({entity: this, position: 'top'})

    const topShape = new Box2D.b2PolygonShape()
    topShape.SetAsBox(this.width / 2, this.size / 2)
    const topFixture = topBody.CreateFixture(topShape, 1.0)
    topBody.ResetMassData()

    // Bottom
    const bottomBd = new Box2D.b2BodyDef()
    bottomBd.position = new Box2D.b2Vec2(0, (0 - this.height / 2) + (this.padding + this.size / 2))
    const bottomBody = world.CreateBody(bottomBd)
    bottomBody.SetUserData({entity: this, position: 'bottom'})

    const bottomShape = new Box2D.b2PolygonShape()
    bottomShape.SetAsBox(this.width / 2, this.size / 2)
    const bottomFixture = bottomBody.CreateFixture(bottomShape, 1.0)
    bottomBody.ResetMassData()

    // Left
    const leftBd = new Box2D.b2BodyDef()
    leftBd.position = new Box2D.b2Vec2(-this.width / 2 + (this.padding + this.size / 2), 0 )
    const leftBody = world.CreateBody(leftBd)
    leftBody.SetUserData({entity: this, position: 'left'})

    const leftShape = new Box2D.b2PolygonShape()
    leftShape.SetAsBox(this.size / 2, this.height / 2)
    const leftFixture = leftBody.CreateFixture(leftShape, 1.0)
    leftBody.ResetMassData()

    // Right
    const rightBd = new Box2D.b2BodyDef()
    rightBd.position = new Box2D.b2Vec2(this.width / 2 - (this.size / 2 + this.padding), 0 )
    const rightBody = world.CreateBody(rightBd)
    rightBody.SetUserData({entity: this, position: 'right'})

    const rightShape = new Box2D.b2PolygonShape()
    rightShape.SetAsBox(this.size / 2, this.height / 2)
    const rightFixture = rightBody.CreateFixture(rightShape, 1.0)
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
