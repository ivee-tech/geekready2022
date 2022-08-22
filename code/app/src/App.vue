<template>
  <div id="app">
     <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <router-view/>
 </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StoreService } from './services/store-service';

@Component
export default class App extends Vue {
  private storeSvc: StoreService = new StoreService();
  private config; 
  @Prop() private msg!: string;
}
</script>

<style>
#app {
  font-family: Script, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #065e1a;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #065e1a;
}

#nav a.router-link-exact-active {
  color: #065e1a;
}
</style>
