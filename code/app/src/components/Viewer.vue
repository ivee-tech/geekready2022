<template>
  <div
    id="sceneDiv"
    ref="sceneDiv"
    :style="{ width: percentageWidth + 'vw', height: percentageHeight + 'vh' }"
  ></div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import * as THREE from "three";
import * as cfg from "iv-3d-lib"; // "../lib/iv-3d-lib/src/wgl-util-cfgs";
import * as lib from "iv-3d-lib"; // "../lib/iv-3d-lib/src/index";
// import * as cfg from 'iv-3d-lib/dist/wgl-util-cfgs';
// import * as lib from 'iv-3d-lib/dist/index';
import * as TWEEN from "tween.js";

@Component<Viewer>({
  watch: {
    model() {
      this.loadData();
    },
  },
})
export default class Viewer extends Vue {
  @Prop() private model!: lib.DataModel;
  @Prop() private percentageWidth: number;
  @Prop() private percentageHeight: number;

  private w: lib.WglUtil = new lib.WglUtil();
  private cameraTimelinePlugins: { [name: string]: lib.ITimelinePlugin } = {};
  private currentTimelineIndex = -1;
  private continuousTimelines: lib.Timeline[] = [];
  private durationTimelineStartCounts: { [ name: string ]: number } = {};

  private fileName!: string;
  private key!: string;
  private mainGroup: THREE.Group;

  private dirLight: any;
  private pointLight: any;
  private pointLight2: any;
  private cube: any;
  private torus: any;
  private sphere: any;
  private particles: any;
  private objHandler!: lib.Iv3dObjectHandler;
  private userSvc!: lib.UserService;
  private errorSvc!: lib.ErrorService;
  private environment!: lib.Iv3dEnvironment;
  private skybox: any;
  private flamebox: any;
  private skyBoxPlugin!: lib.SkyBoxPlugin;

  private basicGroup: any;
  private objGroup: any;
  private objPointsGroup: any;
  private flameBoxGroup: any;
  private skyBoxGroup: any;
  private particlesGroup: any;
  private shadersGroup: any;
  private currentGroup: any;

  private sceneDiv!: HTMLDivElement;

  private roseMesh: any;
  private rosePointsMesh: any;

  private rotateCamera = false;

  private selectedObj: any;
  private isMeshTweening = false;

  private clock = new THREE.Clock();
  private totalShaders = 5;
  private uniforms1: any = {
    time: { type: "", value: 0 },
    resolution: { type: "", value: 0 },
    texture: { type: "", value: 0 },
  };
  private uniforms2: any = {
    time: { type: "", value: 0 },
    resolution: { type: "", value: 0 },
    texture: { type: "", value: 0 },
  };
  private uniforms3: any = {
    time: { type: "", value: 0 },
    resolution: { type: "", value: 0 },
    texture: { type: "", value: 0 },
  };
  private qX = 200;
  private qY = 75;
  private qZ = 100;

  constructor() {
    super();
    if (!lib.WglUtil.detectWebGL()) {
      console.log("Your browser doesn't support WebGL.");
    }
    // this.loadShaders();
  }

  data() {
    return this.model;
  }

  mounted() {
    this.init();
    console.log("model", this.model);
  }

  loadData() {
    console.log("model", this.model);
    if (this.mainGroup) {
      this.w.clear(this.mainGroup);
    } else {
      this.mainGroup = this.objHandler.createMainGroup(this.model, this.w);
    }
    this.objHandler.loadData(
      this.model,
      this.w,
      this.mainGroup,
      true,
      true,
      this.key
    );

    this.evaluateTimelineExpressions();

    if (this.model.timelines && this.model.timelines.length > 0) {
      this.continuousTimelines = [];
    }

    // this.evaluateInitScripts();
    this.cfgTimelinesMeshTweens(false);
    this.animate(0);
  }

  public init() {
    this.sceneDiv = document.getElementById("sceneDiv") as HTMLDivElement;
    this.w.cfg.canvasId = "sceneDiv";
    this.w.cfg.useAxis = false;
    this.w.cfg.useOrbit = true;
    this.w.cfg.useTrackball = false;
    this.w.cfg.useStats = false;
    this.w.cfg.statsId = "statsDiv";
    this.w.cfg.useDatGui = false;
    this.w.cfg.useAsciiEffect = false;
    this.w.cfg.useAnaglyphEffect = false;
    //this.w.cfg.anaglyphFocalLength = 125 / 2;
    const renderCfg: lib.RendererCfg = new lib.RendererCfg();
    renderCfg.width = this.sceneDiv.offsetWidth;
    renderCfg.height = this.sceneDiv.offsetHeight;
    renderCfg.antialias = true;

    const sceneCfg: lib.SceneCfg = {
      useFog: false,
      fogColor: 0xffffff,
      showAxis: false,
      showGrid: false,
    } as lib.SceneCfg;
    const cameraCfg: lib.CameraCfg = {
      fov: 50,
      position: { x: 0, y: 0, z: 300 },
      near: 1,
      far: 2 * 5000,
    } as lib.CameraCfg;
    this.w.init(sceneCfg, cameraCfg, renderCfg);

    this.userSvc = new lib.UserService();
    this.errorSvc = new lib.ErrorService();
    this.environment = new lib.Iv3dEnvironment();
    this.environment.usersDataUrl = "assets/st-users";
    this.environment.assetsRelUrl = 'assets/';

    this.objHandler = new lib.Iv3dObjectHandler(
      this.userSvc,
      this.errorSvc,
      this.environment
    );
    // this.basicGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.objGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.objPointsGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.skyBoxGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.flameBoxGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.particlesGroup = this.objHandler.createMainGroup(this.model, this.w);
    // this.shadersGroup = this.objHandler.createMainGroup(this.model, this.w);

    this.w.removeAxisHelper();

    this.w.glRenderer.domElement.addEventListener(
      "mouseup",
      this.mouseUpHandler,
      false
    );
    this.w.glRenderer.domElement.addEventListener(
      "mousedown",
      this.mouseDownHandler,
      false
    );

    this.addLights();
    console.log(this.pointLight);

    // this.fileName = './assets/demos/public/gyr-particulas.json';
    this.key = this.getKey();

    this.clock = new THREE.Clock();

    this.currentTimelineIndex = 0;
    // let json = require(fileName);
    // this.model = json; // JSON.parse(json);
    // this.download(this.fileName);

    // this.addCube();
    // this.addSphere();
    // this.addTorus();

    // this.addSkyBox();
    // this.skyBoxGroup.visible = false;

    // this.addFlameBox();
    // this.flameBoxGroup.visible = false;

    // this.addParticles();
    // this.particlesGroup.visible = false;

    // this.loadRoseModel(null, null, null);
    // this.objGroup.visible = false;
    // this.objPointsGroup.visible = false;

    // setTimeout(() => {
    // this.createShaderMeshes();
    // this.shadersGroup.visible = false;
    // }, 1000);

    // this.toggleBasic();
  }

  private getKey() {
    let key = "";
    if (this.fileName) {
      if (this.fileName.indexOf("/") >= 0) key = this.fileName.split("/")[0];
      else if (this.fileName.indexOf("\\") >= 0)
        key = this.fileName.split("\\")[0];
    }
    return key;
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
        /*
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, fileName);
                } else {
                    var file = window.URL.createObjectURL(blob);
                    // window.location.assign(file);
                    window.open(file, '_blank');
                    // TODO: use saveContent()
                }
                */
      })
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });
  }

  private animateTimelines(time: number) {
    if (this.model && this.model.timelines) {
      if (
        this.currentTimelineIndex >= 0 &&
        this.currentTimelineIndex < this.model.timelines.length
      ) {
        const timeline: lib.Timeline = this.model.timelines[this.currentTimelineIndex];
        if (timeline.duration > 0) {
          this.cameraTimelinePlugins[timeline.name].update(time);
          // this.animateTimeline(timeline, time);
          const elapsedTime = this.clock.getElapsedTime();
          if (elapsedTime >= timeline.duration) {
            timeline.enabled = false;
            this.clock.stop();
            this.$emit('timeline-stop', timeline);
            for(const tmesh of timeline.meshes) {
              const mesh: any = this.find3dObjectById(tmesh.uuid);
              mesh.visible = false;
            }

            this.currentTimelineIndex++;
            const nextTimeline = this.model.timelines[this.currentTimelineIndex];
            if(nextTimeline) {
              this.durationTimelineStartCounts[nextTimeline.name] = 0;
              this.startOrUpdateDurationTimeline(nextTimeline);
            }
            this.clock.start();
          }
          else {
              if(!this.durationTimelineStartCounts[timeline.name]) this.durationTimelineStartCounts[timeline.name] = 0;
              this.startOrUpdateDurationTimeline(timeline);
          }
        } else {
          this.currentTimelineIndex++;
          const cTimeline: lib.Timeline = this.continuousTimelines.find(
            (item) => item.name === timeline.name
          ) as lib.Timeline;
          if (!cTimeline) {
            this.continuousTimelines.push(timeline);
            this.$emit('timeline-start', timeline);
          }
        }
      } else {
        this.clock.stop();
        this.currentTimelineIndex = 0;
        this.clock.start();
      }
      const index = 0;
      for (const timeline of this.continuousTimelines) {
        this.cameraTimelinePlugins[timeline.name].update(time);
        this.$emit('timeline-update', timeline);
        // this.animateTimeline(timeline, time);
      }
    }
  }

  private evaluateTimelineExpressions() {
    for (const timeline of this.model.timelines) {
      const plugin: lib.ITimelinePlugin = new lib.CameraTimelinePlugin(
        timeline,
        this.errorSvc
      );
      plugin.w = this.w;
      plugin.mainGroup = this.mainGroup;
      plugin.data = this.model;
      this.cameraTimelinePlugins[timeline.name] = plugin;
    }
  }

  private cfgTimelinesMeshTweens(reverse: boolean) {
    for (const timeline of this.model.timelines) {
      for (const tmesh of timeline.meshes) {
        const mesh: any = this.find3dObjectById(tmesh.uuid);
        this.cfgMeshTweens(mesh, tmesh, lib.TriggerType.onAnimate, reverse);
      }
    }
  }

  private cfgMeshTweens(
    mesh: any,
    tmesh: lib.TimelineMesh,
    triggerType: lib.TriggerType,
    useReverse: boolean
  ) {
    if (!tmesh.tweens || tmesh.tweens.length === 0) {
      return;
    }
    for (const tween of tmesh.tweens) {
      this.cfgMeshTween(mesh, tmesh, tween, triggerType, useReverse);
    }
  }

  private cfgMeshTween(
    mesh: any,
    tmesh: lib.TimelineMesh,
    tween: lib.Tween,
    triggerType: lib.TriggerType,
    useReverse: boolean
  ) {
    if (!tmesh || !tween || !tween.enabled) return;
    if (
      tween.positionDisplacement &&
      tween.positionDisplacement.trigger === triggerType
    )
      this.cfgTweenDisplacement(
        mesh,
        tmesh,
        tween.positionDisplacement,
        "position",
        useReverse
      );
    if (
      tween.rotationDisplacement &&
      tween.rotationDisplacement.trigger === triggerType
    )
      this.cfgTweenDisplacement(
        mesh,
        tmesh,
        tween.rotationDisplacement,
        "rotation",
        useReverse
      );
    if (
      tween.scaleDisplacement &&
      tween.scaleDisplacement.trigger === triggerType
    )
      this.cfgTweenDisplacement(
        mesh,
        tmesh,
        tween.scaleDisplacement,
        "scale",
        useReverse
      );
    if (
      tween.colorDisplacement &&
      tween.colorDisplacement.trigger === triggerType
    )
      this.cfgTweenDisplacementColor(mesh, tmesh, tween.colorDisplacement);
  }

  private cfgTweenDisplacement(
    mesh: any,
    tmesh: lib.TimelineMesh,
    displacement: lib.DisplacementXYZ,
    meshPropName: string,
    useReverse: boolean
  ) {
    if (!displacement || !displacement.enabled) {
      return;
    }
    if (!mesh || !Object.prototype.hasOwnProperty.call(mesh, meshPropName)) {
      return;
    }
    let from = { x: 0, y: 0, z: 0 };
    const origPropName = `${meshPropName}Original`;
    if (displacement.useCurrent) {
      if (useReverse) {
        from = {
          x: displacement.max.x,
          y: displacement.max.y,
          z: displacement.max.z,
        };
      } else {
        mesh[origPropName] = {
          x: mesh[meshPropName].x,
          y: mesh[meshPropName].y,
          z: mesh[meshPropName].z,
        };
        from = {
          x: mesh[meshPropName].x,
          y: mesh[meshPropName].y,
          z: mesh[meshPropName].z,
        };
      }
    } else {
      if (useReverse) {
        from = {
          x: displacement.max.x,
          y: displacement.max.y,
          z: displacement.max.z,
        };
      } else {
        from = {
          x: displacement.min.x,
          y: displacement.min.y,
          z: displacement.min.z,
        };
      }
    }
    let to = { x: 0, y: 0, z: 0 };
    if (useReverse) {
      if (displacement.useCurrent) {
        if (mesh[origPropName]) {
          to = {
            x: mesh[origPropName].x,
            y: mesh[origPropName].y,
            z: mesh[origPropName].z,
          };
        } else {
          to = {
            x: displacement.min.x,
            y: displacement.min.y,
            z: displacement.min.z,
          };
        }
      }
    } else {
      to = {
        x: displacement.max.x,
        y: displacement.max.y,
        z: displacement.max.z,
      };
    }
    let tween: TWEEN.Tween = new TWEEN.Tween(from).to(
      to,
      displacement.duration
    );
    if (displacement.easing) {
      tween = tween.easing(
        lib.Iv3dObjectHandler.TweenEasings[displacement.easing]
      );
    }
    if (displacement.repeat > 0) {
      tween = tween.repeat(displacement.repeat);
    } else if (displacement.repeat < 0) {
      tween = tween.repeat(Infinity);
    }
    if (displacement.yoyo) {
      tween = tween.yoyo(true);
    }
    tween = tween.onComplete(() => {
      /*
            tmesh.runtimeTweenReverse = !tmesh.runtimeTweenReverse;
            if (useReverse) {
                displacement.runtimeReverse = !displacement.runtimeReverse;
            }
            */
      if (displacement.script) {
        const scriptCode = displacement.script;
        try {
          const fn = new Function("mesh", scriptCode);
          fn.call(this, mesh);
        } catch (e) {
          this.errorSvc.log(e);
        }
      }
    });
    tween = tween.onUpdate(function (this: {
      x: number;
      y: number;
      z: number;
    }) {
      if (!cfg.U.isEmpty(this.x))
        // && from.x !== to.x)
        mesh[meshPropName].x = this.x;
      if (!cfg.U.isEmpty(this.y))
        // && from.y !== to.y)
        mesh[meshPropName].y = this.y;
      if (!cfg.U.isEmpty(this.z))
        // && from.z !== to.z)
        mesh[meshPropName].z = this.z;
    });
    tween.start();
  }

  private cfgTweenDisplacementColor(
    mesh: any,
    tmesh: lib.TimelineMesh,
    displacement: lib.DisplacementXYZ
  ) {
    if (!displacement || !displacement.enabled) {
      return;
    }
    if (!mesh) {
      return;
    }
    let from = { r: 0, g: 0, b: 0 };
    if (displacement.useCurrent) {
      const color = mesh.material.color;
      from = { r: color.r, g: color.g, b: color.b };
    } else {
      from = {
        r: displacement.min.x,
        g: displacement.min.y,
        b: displacement.min.z,
      };
    }
    const to = {
      r: displacement.max.x,
      g: displacement.max.y,
      b: displacement.max.z,
    };
    const tween: TWEEN.Tween = new TWEEN.Tween(from)
      .to(to, displacement.duration)
      .onUpdate(function (this: { r: number; g: number; b: number }) {
        mesh.material.color.r = this.r;
        mesh.material.color.g = this.g;
        mesh.material.color.b = this.b;
      });
    tween.start();
  }

  //runTweens

  private find3dObjectById(uuid: string) {
    const obj = this.mainGroup.children.find(
      (item: { uuid: string }) => item.uuid === uuid
    );
    return obj;
  }

  private findObjectById(uuid: string) {
    const obj = this.model.container.children.find(
      (item) => item.uuid === uuid
    );
    return obj;
  }

  private findObjectByName(name: string) {
    const obj = this.model.container.children.find(
      (item: lib.Iv3dObject) => item.name === name
    );
    return obj;
  }

  private find3dObjectByName(name: string) {
    const obj: lib.Iv3dObject = this.findObjectByName(name);
    if (obj) {
      return this.find3dObjectById(obj.uuid);
    }
    return null;
  }

  private findTimelineMeshesById(uuid: string) {
    const timelineMeshes: lib.TimelineMesh[] = [];
    for (const timeline of this.model.timelines) {
      const tmesh = timeline.meshes.find((item) => item.uuid === uuid);
      if (tmesh) {
        timelineMeshes.push(tmesh);
      }
    }
    return timelineMeshes;
  }

  public toggleBasic() {
    // if(this.currentGroup) {
    //     this.currentGroup.visible = false;
    // }
    this.basicGroup.visible = !this.basicGroup.visible;
    // this.currentGroup = this.basicGroup;
  }

  public toggleParticles() {
    this.particlesGroup.visible = !this.particlesGroup.visible;
  }

  public toggleObj() {
    // if(this.currentGroup) {
    //     this.currentGroup.visible = false;
    // }
    this.objGroup.visible = !this.objGroup.visible;
    // this.currentGroup = this.objGroup;
  }

  public toggleObjPoints() {
    this.objPointsGroup.visible = !this.objPointsGroup.visible;
  }

  public toggleSkyBox() {
    // this.skyBoxGroup.visible = !this.skyBoxGroup.visible;
    this.flameBoxGroup.visible = !this.flameBoxGroup.visible;
  }

  public toggleAnaglyph() {
    this.w.cfg.useAnaglyphEffect = true;
    this.w.setAnaglyphEffect();
  }

  public toggleAscii() {
    this.w.cfg.useAsciiEffect = true;
    this.w.setAsciiEffect();
  }

  public toggleRotateCamera() {
    this.rotateCamera = !this.rotateCamera;
  }

  public toggleShaders() {
    this.shadersGroup.visible = !this.shadersGroup.visible;
  }

  private addLights() {
    const dirLightColor = 0xffffff;
    const dirLightX = 2000;
    const dirLightY = 0;
    const dirLightZ = 2000;
    this.dirLight = this.w.addDirLight(
      {
        color: dirLightColor,
        position: { x: dirLightX, y: dirLightY, z: dirLightZ },
      },
      null
    ); // this.basicGroup);
    this.dirLight.visible = false;
    //dirLight = w.addDirLight({ position: { x: -40, y: 60, z: 25 } });
    this.pointLight = this.w.addPointLight({
      color: 0xfcd20a,
      helperSphereSize: 0.5,
      intensity: 5,
    });
    this.pointLight2 = this.w.addPointLight({
      color: 0x05438c,
      helperSphereSize: 0.5,
      intensity: 7,
      position: { x: -70, y: 5, z: 70 },
    });
  }

  private addCube() {
    const cubeCfg = {
      width: 32,
      height: 32,
      depth: 32,
      wireframe: false,
      color: Math.random() * 0xffffff,
      position: { x: -120, y: 50, z: 0 },
    };
    this.cube = this.w.addCube(cubeCfg, this.basicGroup);
  }

  private addSphere() {
    const sphereCfg = {
      radius: 16,
      wireframe: true,
      color: Math.random() * 0xffffff,
      position: { x: -150, y: -60, z: 0 },
    };
    this.sphere = this.w.addSphere(sphereCfg, this.basicGroup);
  }

  private addTorus() {
    const torusCfg = {
      radius: 32,
      tube: 8,
      radialSegments: 64,
      tubularSegments: 8,
      p: 2,
      q: 3,
      wireframe: true,
      color: Math.random() * 0xffffff,
      position: { x: 0, y: 0, z: 0 },
    };
    //this.torus = this.w.addTorusKnot(torusCfg, this.mainGroup);
    const geomTorusKnot = this.w.genTorusKnotGeom(torusCfg);
    const matTorusKnot = this.w.genMeshPhongMat(torusCfg);
    this.torus = new THREE.Mesh(geomTorusKnot, matTorusKnot);

    this.w.add(this.torus, this.basicGroup);
  }

  private addParticles() {
    const particlesCfg = { count: 1000, range: 100, size: 0.25 };
    this.particles = this.w.addParticles(particlesCfg, this.particlesGroup);
  }

  private addSkyBox() {
    const boxCfg: lib.SkyBoxCfg = {
      srcFile: "assets/images/skyboxsun5deg2.png",
      size: 1024,
      width: 2 * 5000,
      height: 2 * 5000,
      depth: 2 * 5000,
    } as lib.SkyBoxCfg;

    this.skybox = this.w.addSkyBoxFromFile(boxCfg, this.skyBoxGroup);
  }

  private addFlameBox() {
    const boxCfg: lib.SkyBoxCfg = {
      srcFile: "assets/images/flame-582604.jpg",
      size: 1024,
      width: 2 * 5000,
      height: 2 * 5000,
      depth: 2 * 5000,
    } as lib.SkyBoxCfg;

    this.flamebox = this.w.addSkyBoxFromFile(boxCfg, this.flameBoxGroup);
    this.flamebox.userData = { type: "skybox" };
  }

  private animate = (time: number) => {
    requestAnimationFrame(this.animate);
    if (this.w.cfg.useOrbit) this.w.orbitControls.update();
    if (this.w.cfg.useTrackball) this.w.trackballControls.update();
    if (this.torus) this.w.rotate(this.torus, 0.005);
    if (this.particles) this.w.rotate(this.particles, 0.0005);
    if (this.skyBoxPlugin) this.skyBoxPlugin.update(time);

    const timer = Date.now() * 0.0005;
    if (this.pointLight) {
      this.pointLight.position.x = Math.sin(timer * 4) * 3000;
      this.pointLight.position.y = 600;
      this.pointLight.position.z = Math.cos(timer * 4) * 3000;
    }

    if (this.pointLight2) {
      this.pointLight2.position.x = Math.sin(timer * 4) * 3000;
      this.pointLight2.position.y = 600;
      this.pointLight2.position.z = Math.cos(timer * 4) * 3000;
    }

    if (this.rotateCamera) {
      this.w.camera.position.x += Math.sin(timer) * 0.2; // 020;
      this.w.camera.position.z -= Math.cos(timer) * 0.2; // 020;
      //w.camera.position.y = -200;
    }

    this.adjustUniforms();

    this.w.render();

    this.animateTimelines(time);

    TWEEN.update(time);
  };

  private startOrUpdateDurationTimeline(timeline: lib.Timeline) {
    if(this.durationTimelineStartCounts[timeline.name] === 0) {
      this.$emit('timeline-start', timeline);
      this.durationTimelineStartCounts[timeline.name]++;
    }
    else {
      this.$emit('timeline-update', timeline);
    }
  }

  loadRoseModel(
    onLoaded: Function,
    onLoadRoseProgress: Function,
    onLoadRoseError: Function
  ) {
    this.w.loadObjModel(
      null,
      "open-red-rose/red-white-rose.obj",
      "open-red-rose/texture_map_white_red.jpg",
      (object: any) => {
        const scale = 17;
        this.roseMesh = object;
        this.roseMesh.position.z = -55;
        this.roseMesh.position.y = -20;
        this.roseMesh.scale.set(scale, scale, scale);
        this.roseMesh.userData = { type: "rose" };
        this.w.add(this.roseMesh, this.objGroup);
        //meshes.push(roseMesh);

        const o = this.roseMesh.children[0];

        const pointsFromGeomCfg: lib.PointsFromGeomCfg = {
          color: 0xba0000,
          size: 0.1,
          scale: scale,
        } as lib.PointsFromGeomCfg;
        this.rosePointsMesh = this.w.genPointsMeshFromMesh(
          o,
          pointsFromGeomCfg,
          this.objPointsGroup
        );
        this.roseMesh.visible = true;
        this.rosePointsMesh.visible = true;
        this.rosePointsMesh.scale.x = this.rosePointsMesh.scale.y = this.rosePointsMesh.scale.z = scale;

        this.rosePointsMesh.position.x = this.roseMesh.position.x;
        this.rosePointsMesh.position.y = this.roseMesh.position.y;
        this.rosePointsMesh.position.z = this.roseMesh.position.z;
        this.rosePointsMesh.userData = this.roseMesh.userData;
        this.rosePointsMesh.updateMatrix();

        if (onLoaded) {
          onLoaded();
        }
      },
      onLoadRoseProgress,
      onLoadRoseError
    );
  }

  private onDocumentMouseUp(e: any) {
    this.w.dndMouseUp(e);
    if (this.selectedObj) {
      const intersects = this.w.getMouseUpIntersects(e);
      if (intersects.length > 0) {
        if (intersects[0].object.type == "Mesh") {
          if (this.selectedObj) {
            // resetRotateMesh(selectedObject);
          }
          this.selectedObj = intersects[0].object;
          const obj: lib.Iv3dObject = this.selectedObj.userData as lib.Iv3dObject; 
          console.log(obj);
          if (
            this.selectedObj.userData &&
            this.selectedObj.userData.type == "skybox"
          ) {
            return;
          }
          console.log('panels', this.selectedObj.panels);
          if (obj.url) {
            window.open(obj.url, "_blank");
          } else if (
            obj.contentPanels &&
            obj.contentPanels.length > 0
          ) {
            const arrPanels: string[] = obj.contentPanels.split(",");
            for (const panel of arrPanels) {
              const content: lib.AdditionalContent = this.model.additionalContents.find(
                (item) => item.name === panel
              );
              if (content) {
                content.showFlag = true;
              }
            }
          } else {
            this.clickMesh();
          }
          return;
        }
        if (intersects[0].object instanceof THREE.Line) {
          //toggleObjects();
          return;
        }
      }
    }
  }

  private onDocumentMouseDown(e: any) {
    if (this.sceneDiv) {
      this.sceneDiv.focus();
    }
    this.w.dndMouseDown(e);
    this.selectedObj = this.w.dndSelectedObject;
  }

  private mouseUpHandler: any = (e: any) => {
    this.onDocumentMouseUp(e);
  };

  private mouseDownHandler: any = (e: any) => {
    this.onDocumentMouseDown(e);
  };

  private clickMesh() {
    let from;
    let to;
    const toPosition = new THREE.Vector3();
    if (this.selectedObj.isOpen) {
      from = 5;
      to = 1;
      this.selectedObj.isOpen = false;
      //selectedObject.position.copy(selectedObject.originalPosition);
      toPosition.copy(this.selectedObj.originalPosition);
    } else {
      from = 1;
      to = 5;
      this.selectedObj.isOpen = true;
      this.selectedObj.originalPosition = new THREE.Vector3();
      this.selectedObj.originalPosition.copy(this.selectedObj.position);
      //selectedObject.position.set(0, 0, 0);
      toPosition.set(0, 0, 0);
    }
    const v = { amount: from };
    const tween = new TWEEN.Tween(v)
      .to({ amount: to }, 5000)
      .easing(TWEEN.Easing.Elastic.Out)
      //.repeat(Infinity)
      //.yoyo(true)
      .onStart(() => {
        //selectedObject.isTweening = true;
        this.isMeshTweening = true;
      })
      .onUpdate((t: any) => {
        if (this.selectedObj) {
          this.selectedObj.scale.set(v.amount, v.amount, v.amount);
        }
      })
      .onComplete(() => {
        this.isMeshTweening = false;
        if (this.selectedObj) {
          if (this.selectedObj.isOpen) {
            this.selectedObj.canRotate = false;
            // resetRotateMesh(this.selectedObj);
          } else {
            this.selectedObj.canRotate = true;
          }
        }
      })
      .start();
    const tween2 = new TWEEN.Tween(this.selectedObj.position)
      .to(toPosition, 5000)
      .easing(TWEEN.Easing.Linear.None)
      //.repeat(Infinity)
      //.yoyo(true)
      .onComplete(() => {
        this.isMeshTweening = false;
      })
      .start();
  }

  private loadShaders() {
    this.w.loadShaderFile("THREE.sh2.vertex.glsl", (data: string) => {
      document.getElementById("vertexShader")!.innerText = data;
    });
    for (let i = 1; i <= this.totalShaders; i++) {
      ((k) => {
        this.w.loadShaderFile(
          "THREE.sh2-" + k + ".fragment.glsl",
          (data: string) => {
            document.getElementById("fragmentShader" + k)!.innerText = data;
          }
        );
      })(i);
    }
  }

  private createShaderMesh(
    geom: any,
    vertexShaderId: string,
    fragmentShaderId: string,
    uniforms: any
  ) {
    const mat = this.w.genShaderMaterial({
      vertexShaderId: vertexShaderId,
      fragmentShaderId: fragmentShaderId,
      uniforms: uniforms,
      attributes: {},
    });
    const mesh = this.w.createMesh(geom, mat, null, {
      position: { x: 4, y: 3, z: -7 },
    });
    let r = Math.random();
    const vx = r > 0.5 ? +1 : -1;
    r = Math.random();
    const vy = r < 0.5 ? +1 : -1;
    r = Math.random();
    const vz = r > 0.5 ? +1 : -1;
    const px = Math.random() * this.qX * vx,
      py = Math.random() * this.qY * vy,
      pz = Math.random() * this.qZ * vz;
    mesh.position.x = px; // Math.random() * 100 * vx - 10; // * (i * 3) - ( params.length - 1 ) / 2;
    mesh.position.y = py; // Math.random() * 25 * vy + meshOffsetY; // * ((i % 2) * 4) - 0.5;
    mesh.position.z = pz; // Math.random() * 25 * vz + meshOffsetZ; // * ((i % 2) * 4) - 0.5;
    this.w.add(mesh, this.shadersGroup);

    this.w.rotate(mesh, { x: -0.1, y: -0.5, z: 0.5 });
    return mesh;
  }

  private createShaderMeshes() {
    const shaderCubeGeom = this.w.genCubeGeom({
      width: 64,
      height: 64,
      depth: 64,
      widthSegments: 128,
      heightSegments: 128,
      depthSegments: 128,
    });

    const sphereCfg = {
      radius: 32,
      widthSegments: 128,
      heightSegments: 128,
      color: 0xc9edd4,
      wireframe: true,
      position: { x: 20, y: 4, z: 2 },
      castShadow: true,
      rotation: { x: 0, y: 0, z: 0 },
    };
    const shaderSphereGeom = this.w.genSphereGeom(sphereCfg);

    const torusCfg = {
      radius: 32,
      tube: 16,
      radialSegments: 128,
      tubularSegments: 64,
      arc: 2 * Math.PI,
    };
    const shaderTorusGeom = this.w.genTorusGeom(torusCfg);

    const cylinderCfg = {
      radiusTop: 24,
      radiusBottom: 24,
      height: 64,
      radiusSegments: 128,
      heightSegments: 1,
      openEnded: false,
      color: "#3D7D96",
    };
    const cylinderGeom = this.w.genCylinderGeom(cylinderCfg);

    const planeCfg = {
      width: 120,
      height: 45,
      widthSegments: 1,
      heightSegments: 1,
      color: Math.random() * 0xffffff,
      position: { x: 0, y: 0, z: 0 },
      receiveShadow: true,
    };
    const planeGeom = this.w.genPlaneGeom(planeCfg);

    const circleCfg = {
      radius: 64,
      segments: 32,
      color: Math.random() * 0xffffff,
      wireframe: false,
      position: { x: 20, y: 4, z: 2 },
      castShadow: true,
      rotation: { x: 0, y: 0, z: 0 },
    };
    const circleGeom = this.w.genCircleGeom(circleCfg);

    const shaderGeoms = [
      shaderCubeGeom,
      shaderSphereGeom,
      shaderTorusGeom,
      cylinderGeom,
      planeGeom /*, circleCfg*/,
    ];

    this.uniforms1 = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      texture: null,
    };

    const loader = new THREE.TextureLoader();
    const texture2 = loader.load("assets/textures/chrome.png");

    this.uniforms2 = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      texture: { type: "t", value: texture2 },
    };

    const texture3 = loader.load("assets/textures/lavatile.jpg");

    this.uniforms3 = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      texture: { type: "t", value: texture3 },
    };

    this.uniforms2.texture.value.wrapS = this.uniforms2.texture.value.wrapT = this.uniforms3.texture.value.wrapS = this.uniforms3.texture.value.wrapT =
      THREE.RepeatWrapping;

    const params = [
      ["fragmentShader1", this.uniforms1],
      ["fragmentShader2", this.uniforms2],
      ["fragmentShader3", this.uniforms1],
      ["fragmentShader4", this.uniforms1],
      ["fragmentShader5", this.uniforms3],
    ];

    for (let i = 0; i < params.length; i++) {
      const shaderMesh = this.createShaderMesh(
        shaderGeoms[i],
        "vertexShader",
        params[i][0],
        params[i][1]
      );
      const matIndex = i; // this.getRandomInt(0, params.length - 1);
      const mat = this.w.genShaderMaterial({
        vertexShaderId: "vertexShader",
        fragmentShaderId: params[matIndex][0],
        uniforms: params[matIndex][1],
        attributes: {},
      });
      shaderMesh.material = mat;
      const geomIndex = i; // this.getRandomInt(0, shaderGeoms.length - 1);
      const geom = shaderGeoms[geomIndex];
      shaderMesh.geometry = geom;
    }
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private adjustUniforms() {
    const delta = this.clock.getDelta();

    this.uniforms1.time.value += delta * 5;
    this.uniforms2.time.value = this.clock.elapsedTime;
    this.uniforms3.time.value = this.clock.elapsedTime;
  }
}
</script>