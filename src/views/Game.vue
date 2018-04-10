<template>
  <div class="home">
    <ludic-app :app="app" full-window></ludic-app>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Game from 'game/game'

@Component
export default class Home extends Vue {
  app = Game
}
</script>
