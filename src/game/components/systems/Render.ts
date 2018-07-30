import {BaseSystem, BaseEntity} from 'ein'
import DrawableEntity from '$entities/DrawableEntity'

const DEFAULTS = {
  active: true,
  priority: 10,
  entityQuery: {
    props: ['draw'],
  },
}

export default class RenderSystem extends BaseSystem {

  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D, cfg: any= {}){
    cfg = Object.assign(DEFAULTS, cfg)
    super(cfg)
    this.ctx = ctx
  }
  
  public update(){
    this.entities.forEach((entity) => {
      this.ctx.save()
      entity.draw(this.ctx)
      this.ctx.restore()
    })
  }

  public onEntityAdded(entity: BaseEntity & DrawableEntity){
    this.entities.push(entity)
  }

  public onEntityRemoved(entity: BaseEntity & DrawableEntity){
    this.entities.splice(this.entities.indexOf(entity), 1)
  }

}
