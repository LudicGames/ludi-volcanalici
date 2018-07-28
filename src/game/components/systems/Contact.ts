import {BaseSystem} from 'ein'
import {Box2D, World} from 'ludic-box2d'

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
    // this.world = world
    // this.initContactFilter()
    this.contactFilter = new World.ContactFilter(this.onShouldCollide.bind(this))
    world.addContactFilter(this.contactFilter)
  }

  onShouldCollide(a, b){
    // Player is 1
    // Platforms are 2
    // Everything else is 0
    if(a.GetUserData() == 0 || b.GetUserData() == 0){
      // if(a.GetBody().entity && b.GetBody().entity){
      //   console.log('NO CONTACT', a.GetUserData(), b.GetUserData())
      //   console.log('> entities', a.GetBody().entity, b.GetBody().entity)
      //   console.log('> sensor:', a.IsSensor(), b.IsSensor())
      // }
      if(!a.IsSensor() && !b.IsSensor()){
        return true
      }
    }

    let should_collide = null
    this.entities.forEach(entity => {
      if(a.GetBody().entity === entity){
        let tmp = entity.shouldCollide(a, b)
        if(should_collide === null){
          should_collide = tmp
        }
      }
      if(b.GetBody().entity === entity){
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

  onEntityAdded(entity){
    this.entities.push(entity)
  }

  onEntityRemoved(entity){
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

  update(){}
}
