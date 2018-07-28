import { BaseEntity } from 'ein'
import { World, Box2D } from 'ludic-box2d'

const WORLD_MAP = new WeakMap()
const BODY_MAP = new WeakMap()

export default abstract class Box2DEntity extends BaseEntity {

  /**
   * we map this property like this to prevent entitys from holding a strong
   * reference to the world, avoiding mem-leakage
   */
  get world(): World {
    return WORLD_MAP.get(this)
  }
  set world(world: World) {
    WORLD_MAP.set(this, world)
  }

  get body(): Box2D.b2Body {
    return BODY_MAP.get(this)
  }
  set body(body: Box2D.b2Body){
    BODY_MAP.set(this, body)
    // also set the entity onto the body
    body.entity = this
  }

}
