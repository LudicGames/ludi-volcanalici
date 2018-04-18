import {Box2D} from 'ludic-box2d'
import {BaseEntity} from 'ein'

export default class Wall extends BaseEntity {
  constructor(width, height, world, color='orange', padding=0, active=true, priority=-1){
    super(active, priority)
    this.width = width
    this.height = height
    this.world = world
    this.color = color
    this.padding = padding
    this.size = 1
    this.createB2D(world)
  }

  createB2D(world){
    // Top
    let top_bd = new Box2D.b2BodyDef()
    top_bd.set_position(new Box2D.b2Vec2(0, (this.height / 2) - (this.padding + this.size / 2)))
    let top_body = world.CreateBody(top_bd)

    let top_shape = new Box2D.b2PolygonShape()
    top_shape.SetAsBox(this.width / 2, this.size / 2)
    let top_fixture = top_body.CreateFixture(top_shape, 0.0)
    top_fixture.SetDensity(1.0)
    top_body.ResetMassData()

    // Bottom
    let bottom_bd = new Box2D.b2BodyDef()
    bottom_bd.set_position(new Box2D.b2Vec2(0, (0 - this.height / 2) + (this.padding + this.size / 2)))
    let bottom_body = world.CreateBody(bottom_bd)

    let bottom_shape = new Box2D.b2PolygonShape()
    bottom_shape.SetAsBox(this.width / 2, this.size / 2)
    let bottom_fixture = bottom_body.CreateFixture(bottom_shape, 0.0)
    bottom_fixture.SetDensity(1.0)
    bottom_body.ResetMassData()

    // Left
    let left_bd = new Box2D.b2BodyDef()
    left_bd.set_position(new Box2D.b2Vec2(-this.width / 2 + (this.padding + this.size / 2), 0 ))
    let left_body = world.CreateBody(left_bd)

    let left_shape = new Box2D.b2PolygonShape()
    left_shape.SetAsBox(this.size / 2, this.height / 2)
    let left_fixture = left_body.CreateFixture(left_shape, 0.0)
    left_fixture.SetDensity(1.0)
    left_body.ResetMassData()

    // Right
    let right_bd = new Box2D.b2BodyDef()
    right_bd.set_position(new Box2D.b2Vec2(this.width / 2 - (this.size / 2 + this.padding), 0 ))
    let right_body = world.CreateBody(right_bd)

    let right_shape = new Box2D.b2PolygonShape()
    right_shape.SetAsBox(this.size / 2, this.height / 2)
    let right_fixture = right_body.CreateFixture(right_shape, 0.0)
    right_fixture.SetDensity(1.0)
    right_body.ResetMassData()

  }

  draw(ctx){
    // Top
    ctx.fillStyle = this.color
    ctx.fillRect(-this.width / 2 + this.padding,  this.height / 2 - (this.size + this.padding), this.width - this.padding * 2, this.size)

    // Bottom
    ctx.fillRect(-this.width / 2 + this.padding,  -this.height / 2 + this.padding, this.width - this.padding * 2, this.size)

    // left
    ctx.fillRect(-this.width / 2 + this.padding,  -this.height / 2 + this.padding, this.size, this.height - (this.padding * 2))

    // right
    ctx.fillRect(this.width / 2 - (this.size + this.padding),  -this.height / 2 + this.padding, this.size, this.height - (this.padding * 2))

  }
}
