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
    // this.initContactFilter()
  }

  public createB2D(){
    const bd = new Box2D.b2BodyDef()
    bd.set_position(new Box2D.b2Vec2(this.x, this.y))
    this.body = this.world.CreateBody(bd)

    const shape = new Box2D.b2PolygonShape()
    shape.SetAsBox(this.width / 2, this.height / 2)
    this.fixture = this.body.CreateFixture(shape, 0.0)
    this.fixture.SetDensity(1.0)
    this.body.ResetMassData()
  }


  public initContactFilter(){
    let filter = new Box2D.JSContactFilter()
    filter.ShouldCollide = (a, b) => {
      if(a == this.fixture.a){
		    let my_position = a.GetBody().GetPosition()
        let player_position = b.GetBody().GetPosition()
      } else if(b == this.fixture.a){
		    let my_position = b.GetBody().GetPosition()
        let player_position = a.GetBody().GetPosition()
      } else {
        return true
      }

      if(player_position.get_y() < my_position.get_y()){
        console.log("false")
        return false
      } else {
        console.log("true")
        return true
      }
    }

    this.world.SetContactFilter(filter)



  }

  public onBeginContact(contact, me, them){
    let platformBody = me.GetBody()
    let otherBody = them.GetBody()

    let vel = otherBody.GetLinearVelocity()
    let numPoints = contact.GetManifold().get_pointCount()

    if(vel.get_y() > 0){
      // contact.SetEnabled(false)
    }
    contact.SetEnabled(false)
    // console.log(numPoints)

    // let worldManifold = new Box2D.b2Manifold()
    // contact.GetWorldManifold(worldManifold)






    // //check if contact points are moving downward
    // for (int i = 0; i < numPoints; i++) {
    //   b2Vec2 pointVel =
    //     otherBody->GetLinearVelocityFromWorldPoint( worldManifold.points[i] );
    //   if ( pointVel.y < 0 )
    //     return;//point is moving down, leave contact solid and exit
    // }

    // //no points are moving downward, contact should not be solid
    // contact->SetEnabled(false);

  }

  public onEndContact(contact, me, them){
    // contact.SetEnabled(true)
    // console.log("platform contact")
  }


  public draw(ctx: CanvasRenderingContext2D){
    ctx.save()
    ctx.fillStyle = this.color
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
    ctx.restore()
  }
}
