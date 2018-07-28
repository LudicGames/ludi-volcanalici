import { UILayer } from 'ludic-vue'
import { Box2D } from '@ludic/ludic-box2d'
import Box2DEntity from '$entities/Box2DEntity'

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

// augement the Box2D.b2Body class to have an entity property
declare module '@ludic/ludic-box2d' {
  namespace Box2D {
    interface b2Body {
      entity: Box2DEntity
    }
  }
}