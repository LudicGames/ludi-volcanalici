import {BaseSystem} from 'ein'

const DEFAULTS = {
  active: true,
  priority: 10,
  entityQuery: {
    props: ['draw']
  }
}

export default class RenderSystem extends BaseSystem {
  constructor(ctx, cfg={}){
    cfg = Object.assign(DEFAULTS, cfg)
    super(cfg)
    this.ctx = ctx
  }

  onEntityAdded(entity){
    this.entities.push(entity)
  }

  onEntityRemoved(entity){
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

  update(){
    this.entities.forEach(entity => {
      this.ctx.save()
      entity.draw(this.ctx)
      this.ctx.restore()
    })
  }
}
