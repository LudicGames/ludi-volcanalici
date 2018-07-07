import {BaseSystem} from 'ein'
import {Box2D} from 'ludic-box2d'

const DEFAULTS = {
  active: true,
  priority: 1,
  entityQuery: {
    props: ['onBeginContact']
  }
}

export default class ContactSystem extends BaseSystem {
  constructor(world, cfg={}){
    cfg = Object.assign(DEFAULTS, cfg)
    super(cfg)
    this.world = world
    this.initContactListener()
  }

  initContactListener(){
    let listener = new Box2D.JSContactListener()

    listener.EndContact = contactPtr => {
      // let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact)
      // let a = contact.GetFixtureA()
      // let b = contact.GetFixtureB()

      // this.entities.forEach(entity => {
      //   if(entity.fixture == a){
      //     entity.onEndContact(contact, a, b)
      //   }
      //   if(entity.fixture == b){
      //     entity.onEndContact(contact, b, a)
      //   }
      // })
    }

    // Init these, or else B2D will explode
    listener.BeginContact = (contactPtr) => {
      let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact)
      let a = contact.GetFixtureA()
      let b = contact.GetFixtureB()

      this.entities.forEach(entity => {
        if(entity.fixture == a){
          entity.onBeginContact(contact, a, b)
        }
        if(entity.fixture == b){
          entity.onBeginContact(contact, b, a)
        }
      })
    }
    listener.PreSolve = function (contactPtr, manifoldPtr) {}
    listener.PostSolve = function (contactPtr, contactImpulsePtr) {}
    this.world.SetContactListener(listener)
  }

  onEntityAdded(entity){
    this.entities.push(entity)
  }

  onEntityRemoved(entity){
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

  update(){}
}
