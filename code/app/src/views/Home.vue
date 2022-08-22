<template>
  <div class="home">
    <Main msg="..."/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Main from '@/components/Main.vue'; // @ is an alias to /src


@Component<Home>({
  components: {
    Main,
  },
  mounted: function () {
    // ...
  },
})
export default class Home extends Vue {

}
</script>
