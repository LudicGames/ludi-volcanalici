import {BaseSystem} from 'ein'
import {Box2D} from 'ludic-box2d'

const DEFAULTS = {
  active: true,
  priority: 1,
  entityQuery: {
    props: ['shouldCollide']
  }
}

export default class ContactSystem extends BaseSystem {
  constructor(world, cfg={}){
    cfg = Object.assign(DEFAULTS, cfg)
    super(cfg)
    this.world = world
    this.initContactFilter()
  }

  public initContactFilter(){
    let filter = new Box2D.JSContactFilter()
    filter.ShouldCollide = (a, b) => {
      a = Box2D.wrapPointer(a, Box2D.b2Fixture)
      b = Box2D.wrapPointer(b, Box2D.b2Fixture)

      // Player is 1
      // Platforms are 2
      // Everything else is 0
      if(a.GetUserData() == 0 || b.GetUserData() == 0){
        return true
      }

      let should_collide = null
      this.entities.forEach(entity => {
        if(entity.fixture == a){
          let tmp = entity.shouldCollide(a, b)
          if(should_collide === null){
            should_collide = tmp
          }
        }
        if(entity.fixture == b){
          let tmp = entity.shouldCollide(b, a)
          if(should_collide === null){
            should_collide = tmp
          }
        }
      })

      if(should_collide != null){
        return should_collide
      }
      if(a.GetUserData() != 0 && b.GetUserData() != 0){
        return false
      }
      return true
    }
    this.world.SetContactFilter(filter)
  }

  onEntityAdded(entity){
    this.entities.push(entity)
  }

  onEntityRemoved(entity){
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

  update(){}
}
