<template>
  <div>
    <Viewer
      :model="model"
      :percentageWidth="100"
      :percentageHeight="100"
      v-on:timeline-start="onTimelineStart"
      v-on:timeline-stop="onTimelineStop"
    />
    <div class="storyText" id="storyText" v-html="currentContent"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Viewer from "@/components/Viewer.vue"; // @ is an alias to /src
import * as lib from "iv-3d-lib"; // "../lib/iv-3d-lib/src/index";

@Component({
  components: {
    Viewer,
  },
})
export default class Story extends Vue {
  private model: lib.DataModel;
  private fileName: string;
  private storyText: HTMLDivElement;
  private scrollInterval;
  private currentContent = "";

  constructor() {
    super();
    this.model = new lib.DataModel();
  }

  mounted() {
    this.fileName = this.$route.query.fn?.toString();
    // let json = require(fileName);
    // this.data = json; // JSON.parse(json);
    this.download(this.fileName);
  }

  download(url: string, fileName?: string) {
    const headers: Headers = new Headers();
    return fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: headers,
    })
      .then((res) => {
        console.log(res);
        return res.blob();
      })
      .then((blob) => {
        blob.text().then((text) => {
          this.model = JSON.parse(text);
        });
      });
  }

  scrollDiv() {
    this.storyText = document.getElementById("storyText") as HTMLDivElement;
    if (!this.storyText) return;
    const d = this.storyText;
    // console.log("scrollTop", d.scrollTop);
    // console.log("diff", d.scrollHeight - d.offsetHeight);
    if (d.scrollTop == 0 || d.scrollTop < d.scrollHeight - d.offsetHeight) {
      d.scrollTop = d.scrollTop + 1;
    } else {
      // setTimeout(() => { d.scrollTo(0, 0); }, 0);
      clearInterval(this.scrollInterval);
    }
  }

  onTimelineStart(timeline: lib.Timeline) {
    console.log("timeline started: ", timeline.name);
    if (timeline.enabled && timeline.contentPanels) {
      const arrPanels: string[] = timeline.contentPanels.split(",");
      let contents = "";
      for (const panel of arrPanels) {
        const content: lib.AdditionalContent = this.model.additionalContents.find(
          (item) => item.name === panel
        );
        if (content) {
          content.showFlag = true;
          contents += content.content;
        }
      }
      const d = document.getElementById("storyText") as HTMLDivElement;
      if(timeline.name === 'T1') {
        d.style.opacity = '0';
        d.style.animation = 'fadein 2s linear forwards';
      }
      d.style.opacity = '1';
      d.style.animation = 'fadeout 2s linear forwards';
      setTimeout(() => {
        this.currentContent = contents;
        d.style.opacity = '0';
        d.style.animation = 'fadein 2s linear forwards';
      }, 2000);
      this.scrollInterval = setInterval(this.scrollDiv, 50);
    }
  }

  onTimelineStop(timeline: lib.Timeline) {
    console.log("timeline stopped: ", timeline.name);
  }
}
</script>
