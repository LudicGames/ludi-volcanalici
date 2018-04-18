import {BaseEntity} from 'ein'
import {Box2D} from 'ludic-box2d'

const DEFS = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  color: 'blue',
  isDynamic: true,
  gamepadIndex: null,
}

export default class Player extends BaseEntity{
  constructor(xOrOptions, y=DEFS.y, width=DEFS.width, height=DEFS.height, color=DEFS.color, world=null){
    super(true, -1)
    if(typeof xOrOptions == 'object'){
      let opts = {...DEFS, ...xOrOptions}
      this.x = opts.x
      this.y = opts.y
      this.width = opts.width
      this.height = opts.height
      this.isDynamic = opts.isDynamic
      this.color = opts.color
      this.gamepadIndex = opts.gamepadIndex
      world = opts.world
    } else {
      this.x = xOrOptions
      this.y = y
      this.width = width
      this.height = height
      this.isDynamic = true
      this.color = color
    }
    if(world == null){
      throw 'Player needs a world for init.'
    }
    this.createB2D(world)
  }

  createB2D(world){
    var bd = new Box2D.b2BodyDef()
    if(this.isDynamic){
      bd.set_type(Box2D.b2_dynamicBody)
    }
    bd.set_position(new Box2D.b2Vec2(this.x, this.y))
    this.body = world.CreateBody(bd)

    var shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    this.fixture = this.body.CreateFixture(shape, 0.0)
    this.fixture.SetDensity(10.0)
    this.body.ResetMassData()
  }

  getPosition(easyRead){
    var pos

    this.pos = this.body.GetPosition()

    if(easyRead){
      pos = {
        x:this.pos.get_x(),
        y:this.pos.get_y()
      }
    } else {
      pos = this.pos
    }
    return pos
  }

  draw(ctx){

    let pos = this.getPosition(true)
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.rotate(this.body.GetAngle())
    ctx.translate(-(pos.x), -(pos.y))
    ctx.fillStyle = this.color
    ctx.fillRect(pos.x - this.width / 2, pos.y - this.height / 2, this.width, this.height)
    ctx.restore()
  }
}
