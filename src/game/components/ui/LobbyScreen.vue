<template lang="pug">
  #splash-screen
    h1 PARTY GAME

    .mode-select
      span.mode(:class="{'active': !teams}") Free For All
      span.mode(:class="{'active': teams}") Teams

</template>

<script lang="ts">
import {LudicComponent} from 'ludic-vue'
import { Component, Vue } from 'vue-property-decorator'
import Game from 'game/game'

@Component
export default class Home extends Component {

}


// export default LudicComponent.extend({
//   name: 'SplashScreen',
//   data(){
//     return {
//       ready: false,
//       teams: false
//     }
//   },
//   ludicInput(){
//     return {
//       inputListener: {
//         methods: {
//           cross: this.start,
//           down: this.toggleTeams,
//           up: this.toggleTeams,
//         },
//       },
//     }
//   },
//   methods: {
//     toggleTeams(down, {gameIndex}){
//       if(!down){
//         this.teams = !this.teams
//       }
//     },
//     start(down){
//       if(!down){
//         this.$ludicEmit('onReady', this.teams)
//       }
//     }
//   },
// })
</script>

<style lang="stylus">
#splash-screen
  height 100%
  background linear-gradient(to left, #ff512f, #dd2476)
  font-family 'Permanent Marker', cursive
  h1
    text-align center
    color white
    font-size 9em
    margin 0
    padding-top 1em
    padding-bottom 1em
  .mode-select
    display flex
    justify-content center
    align-items center
    flex-wrap wrap
    .mode
      text-align center
      flex-basis 100%
      color white
      font-size 3em
      transition all .2s
      &.active
        font-size 3.8em
        background rgba(0, 0, 0, .6)
</style>
