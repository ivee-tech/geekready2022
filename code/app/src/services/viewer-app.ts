import * as THREE from 'three';
// import * as lib from './iv-3d-lib/src/index';
import * as lib from 'iv-3d-lib/dist/index';
import * as TWEEN from 'tween.js';

export class ViewerApp {

    private baseUrl: string = process.env.BASE_URL;
    private w: lib.WglUtil = new lib.WglUtil();
    private dirLight;
    private pointLight;
    private pointLight2;
    private cube: any;
    private torus: any;
    private sphere: any;
    private particles: any;
    private objHandler: lib.Iv3dObjectHandler;
    private userSvc: lib.UserService;
    private errorSvc: lib.ErrorService;
    private environment: lib.Iv3dEnvironment;
    private data: lib.DataModel;
    private skybox: any;
    private flamebox: any;
    private skyBoxPlugin: lib.SkyBoxPlugin;

    private basicGroup: any;
    private objGroup: any;
    private objPointsGroup: any;
    private flameBoxGroup: any;
    private skyBoxGroup: any;
    private particlesGroup: any;
    private shadersGroup: any;
    private currentGroup;

    private sceneDiv: HTMLDivElement;

    private roseMesh;
    private rosePointsMesh;

    private rotateCamera: boolean = true;

    private selectedObj;
    private isMeshTweening: boolean = false;

    private clock = new THREE.Clock();
    private totalShaders: number = 5;
    private uniforms1 = { time: { type: '', value: null }, resolution: { type: '', value: null }, texture: { type: '', value: null } };
    private uniforms2 = { time: { type: '', value: null }, resolution: { type: '', value: null }, texture: { type: '', value: null } };
    private uniforms3 = { time: { type: '', value: null }, resolution: { type: '', value: null }, texture: { type: '', value: null } };
    private qX = 200; private qY = 75; private qZ = 100;


    constructor() {
        if (!lib.WglUtil.detectWebGL()) {
            console.log('Your browser doesn\'t support WebGL.');
        }
        // this.loadShaders();
    }

    public init() {
        this.sceneDiv = document.getElementById('main-div') as HTMLDivElement;
        this.w.cfg.canvasId = 'main-div';
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
          position: { x: 75, y: 75, z: 1 },
          near: 1,
          far: 2 * 5000,
        } as lib.CameraCfg;
        this.w.init(sceneCfg, cameraCfg, renderCfg);
    
        this.userSvc = new lib.UserService();
        this.errorSvc = new lib.ErrorService();
        this.environment = new lib.Iv3dEnvironment();
        this.w.objModelCfg.srcDir = this.baseUrl + 'assets/models/';
        this.data = new lib.DataModel();

        this.objHandler = new lib.Iv3dObjectHandler(this.userSvc, this.errorSvc, this.environment);
        this.basicGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.objGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.objPointsGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.skyBoxGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.flameBoxGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.particlesGroup = this.objHandler.createMainGroup(this.data, this.w);
        this.shadersGroup = this.objHandler.createMainGroup(this.data, this.w);

        this.w.removeAxisHelper();

        this.w.glRenderer.domElement.addEventListener('mouseup', this.mouseUpHandler, false);
        this.w.glRenderer.domElement.addEventListener('mousedown', this.mouseDownHandler, false);
    
        this.addLights();

        /*
        this.addCube();
        this.addSphere();
        this.addTorus();
        */
       this.basicGroup.visible = false;

        // this.addSkyBox();
        // this.skyBoxGroup.visible = false;

        // this.addFlameBox();
        // this.flameBoxGroup.visible = false;

        this.addParticles();
        this.particlesGroup.visible = true;
        
        this.loadRoseModel(null, null, null);
        // this.objGroup.visible = true;
        // this.objPointsGroup.visible = true;
        console.log(this.objGroup);
        console.log(this.objPointsGroup);

        setTimeout(() => {
        this.createShaderMeshes();
        this.shadersGroup.visible = false;
        }, 1000);

        // this.toggleBasic();

        this.animate();
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
        console.log(this.objPointsGroup);
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
        let dirLightColor: number = 0xFFFFFF;
        let dirLightX = 2000;
        let dirLightY = 0;
        let dirLightZ = 2000;
        this.dirLight = this.w.addDirLight({ color: dirLightColor, position: { x: dirLightX, y: dirLightY, z: dirLightZ } }, null); // this.basicGroup);
        this.dirLight.visible = false;
        //dirLight = w.addDirLight({ position: { x: -40, y: 60, z: 25 } });
        this.pointLight = this.w.addPointLight({ color: 0xFCD20A, helperSphereSize: 0.5, intensity: 5 });
        this.pointLight2 = this.w.addPointLight({ color: 0X05438C, helperSphereSize: 0.5, intensity: 7, position: { x: -70, y: 5, z: 70 } });
        }

    private addCube() {
        let cubeCfg = { width: 32, height: 32, depth: 32, wireframe: false, color: Math.random() * 0xFFFFFF, position: { x: -120, y: 50, z: 0 } };
        this.cube = this.w.addCube(cubeCfg, this.basicGroup);
    }

    private addSphere() {
        let sphereCfg = { radius: 16, wireframe: true, color: Math.random() * 0xFFFFFF, position: { x: -150, y: -60, z: 0 }  };
        this.sphere = this.w.addSphere(sphereCfg, this.basicGroup);
    }

    private addTorus() {
        let torusCfg = { radius: 32, tube: 8, radialSegments: 64, tubularSegments: 8, p: 2, q: 3, 
            wireframe: true, color: Math.random() * 0xFFFFFF, position: { x: 0, y: 0, z: 0 }  };
        //this.torus = this.w.addTorusKnot(torusCfg, this.mainGroup);
        let geomTorusKnot = this.w.genTorusKnotGeom(torusCfg);
        let matTorusKnot = this.w.genMeshPhongMat(torusCfg);
        this.torus = new THREE.Mesh(geomTorusKnot, matTorusKnot);
        
        this.w.add(this.torus, this.basicGroup);
    }

    private addParticles() {
        let particlesCfg = { count: 1000, range: 100, size: 0.25 };
        this.particles = this.w.addParticles(particlesCfg, this.particlesGroup);
    }

    private addSkyBox() {
        let boxCfg: lib.SkyBoxCfg = {
            srcFile: 'assets/images/skyboxsun5deg2.png',
            size: 1024,  width: 2 * 5000, height: 2 * 5000, depth: 2 * 5000
        } as lib.SkyBoxCfg;
    
        this.skybox = this.w.addSkyBoxFromFile(boxCfg, this.skyBoxGroup);
    }

    private addFlameBox() {
        let boxCfg: lib.SkyBoxCfg = {
            srcFile: 'assets/images/flame-582604.jpg',
            size: 1024,  width: 2 * 5000, height: 2 * 5000, depth: 2 * 5000
        } as lib.SkyBoxCfg;
    
        this.flamebox = this.w.addSkyBoxFromFile(boxCfg, this.flameBoxGroup);
        this.flamebox.userData = { type: 'skybox' };
    }

    private animate = (time?) => {

        requestAnimationFrame(this.animate);
        if (this.w.cfg.useOrbit) this.w.orbitControls.update();
        if (this.w.cfg.useTrackball) this.w.trackballControls.update();
        if(this.torus) this.w.rotate(this.torus, 0.005);
        if(this.particles) this.w.rotate(this.particles, 0.0005);
        if(this.skyBoxPlugin) this.skyBoxPlugin.update(time);

        let timer = Date.now() * 0.0005;
        this.pointLight.position.x = Math.sin( timer * 4 ) * 3000;
        this.pointLight.position.y = 600;
        this.pointLight.position.z = Math.cos( timer * 4 ) * 3000;
    
        this.pointLight2.position.x = Math.sin( timer * 4 ) * 3000;
        this.pointLight2.position.y = 600;
        this.pointLight2.position.z = Math.cos( timer * 4 ) * 3000;

        if(this.rotateCamera) {
            this.w.camera.position.x += Math.sin( timer ) * 0.2; // 020;
            this.w.camera.position.z -= Math.cos( timer ) * 0.2; // 020;
            //w.camera.position.y = -200;
        }
    
        this.adjustUniforms();

        this.w.render();

        TWEEN.update(time);
    }
    
    loadRoseModel(onLoaded, onLoadRoseProgress, onLoadRoseError) {
        this.w.loadObjModel(null, "open-red-rose/red-white-rose.obj", "open-red-rose/texture_map_white_red.jpg", (object) => {
            if(onLoaded) { 
            }
            let scale = 17;
            this.roseMesh = object;
            this.roseMesh.position.z = -55;
            this.roseMesh.position.y = -20;
            this.roseMesh.scale.set(scale, scale, scale);
            this.roseMesh.userData = { type: "rose" }; 
            this.w.add(this.roseMesh, this.objGroup);
            //meshes.push(roseMesh);
    
            let o = this.roseMesh.children[0];

            let pointsFromGeomCfg: lib.PointsFromGeomCfg = {
                color: 0xBA0000, size: 0.1, scale: scale
            } as lib.PointsFromGeomCfg;
            this.rosePointsMesh = this.w.genPointsMeshFromMesh(o, pointsFromGeomCfg, this.objPointsGroup);
            this.roseMesh.visible = true;
            this.rosePointsMesh.visible = true;
            this.rosePointsMesh.scale.x = this.rosePointsMesh.scale.y = this.rosePointsMesh.scale.z = scale;
    
            this.rosePointsMesh.position.x = this.roseMesh.position.x;
            this.rosePointsMesh.position.y = this.roseMesh.position.y;
            this.rosePointsMesh.position.z = this.roseMesh.position.z;
            this.rosePointsMesh.userData = this.roseMesh.userData;
            this.rosePointsMesh.updateMatrix();
            // this.w.add(this.rosePointsMesh, this.objPointsGroup);
            
            if(onLoaded) {
                onLoaded();
            }
        }, onLoadRoseProgress, onLoadRoseError);
    }

    private onDocumentMouseUp(e) {
        this.w.dndMouseUp(e);
        if (this.selectedObj) {
            let intersects = this.w.getMouseUpIntersects(e);
            if(intersects.length > 0) {
                if(intersects[0].object.type == 'Mesh' ) {
                    if(this.selectedObj) {
                        // resetRotateMesh(selectedObject);
                    }
                    this.selectedObj = intersects[0].object;
                    console.log(this.selectedObj);
                    if(this.selectedObj.userData && this.selectedObj.userData.type == 'skybox') {
                        return;
                    }
                    this.clickMesh();
                    return;
                }
                if(intersects[0].object instanceof THREE.Line) {
                    //toggleObjects();
                    return;
                }
            }
            else {
            }
                }
    }

    private onDocumentMouseDown(e) {
        if (this.sceneDiv) {
            this.sceneDiv.focus();
        }
        this.w.dndMouseDown(e);
        this.selectedObj = this.w.dndSelectedObject;
    }

    private mouseUpHandler: any = (e) => {
        this.onDocumentMouseUp(e);
    };

    private mouseDownHandler: any = (e) => {
        this.onDocumentMouseDown(e);
    };

    private clickMesh() {
        let from; let to; let toPosition = new THREE.Vector3();
        if(this.selectedObj.isOpen) {
            from = 5; to = 1;
            this.selectedObj.isOpen = false;
            //selectedObject.position.copy(selectedObject.originalPosition);
            toPosition.copy(this.selectedObj.originalPosition);
        }
        else {
            from = 1; to = 5;
            this.selectedObj.isOpen = true;
            this.selectedObj.originalPosition = new THREE.Vector3();
            this.selectedObj.originalPosition.copy(this.selectedObj.position);
            //selectedObject.position.set(0, 0, 0);
            toPosition.set(0, 0, 0);
        }
        let v = { amount: from };
        let tween = new TWEEN
            .Tween(v)
            .to({amount: to}, 5000)
            .easing(TWEEN.Easing.Elastic.Out)
            //.repeat(Infinity)
            //.yoyo(true)
            .onStart(() => {
                //selectedObject.isTweening = true;
                this.isMeshTweening = true;
            })
            .onUpdate((t) => {
                if(this.selectedObj) {
                    this.selectedObj.scale.set(v.amount, v.amount, v.amount);
                }
            })
            .onComplete(() => {
                this.isMeshTweening = false;
                if(this.selectedObj) {
                    if(this.selectedObj.isOpen) {
                        this.selectedObj.canRotate = false;
                        // resetRotateMesh(this.selectedObj);
                    }
                    else {
                        this.selectedObj.canRotate = true;
                    }
                }
            })
            .start();
        let tween2 = new TWEEN
            .Tween(this.selectedObj.position)
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
        this.w.loadShaderFile("THREE.sh2.vertex.glsl", (data) => {
            document.getElementById('vertexShader').innerText = data;
        });
        for(let i = 1; i <= this.totalShaders; i++) {
            ((k) => {
                this.w.loadShaderFile("THREE.sh2-" + k + ".fragment.glsl", (data) => {
                    document.getElementById("fragmentShader" + k).innerText = data;
                });
            })(i);
        }
    }

    private createShaderMesh(geom, vertexShaderId, fragmentShaderId, uniforms) {
        let mat = this.w.genShaderMaterial({ vertexShaderId: vertexShaderId, fragmentShaderId: fragmentShaderId, uniforms: uniforms, attributes: {} });
        let mesh = this.w.createMesh(geom, mat, null, { position: { x: 4, y: 3, z: -7 } });
        let r = Math.random();
        let vx = r > 0.5 ? +1 : -1;
        r = Math.random();
        let vy = r < 0.5 ? +1 : -1;
        r = Math.random();
        let vz = r > 0.5 ? +1 : -1;
        let px = Math.random() * this.qX * vx, py = Math.random() * this.qY * vy, pz = Math.random() * this.qZ * vz;
        mesh.position.x = px; // Math.random() * 100 * vx - 10; // * (i * 3) - ( params.length - 1 ) / 2;
        mesh.position.y = py; // Math.random() * 25 * vy + meshOffsetY; // * ((i % 2) * 4) - 0.5;
        mesh.position.z = pz; // Math.random() * 25 * vz + meshOffsetZ; // * ((i % 2) * 4) - 0.5;
        this.w.add(mesh, this.shadersGroup);
        
        this.w.rotate(mesh, { x: -0.1, y: -0.5, z: 0.5 });
        return mesh;
    }

    private createShaderMeshes() {
        let shaderCubeGeom = this.w.genCubeGeom({ width: 64, height: 64, depth: 64, widthSegments: 128, heightSegments: 128, depthSegments: 128});

        let sphereCfg = {
            radius: 32, widthSegments: 128, heightSegments: 128, color: 0xC9EDD4, wireframe: true, position: { x: 20, y: 4, z: 2 },
            castShadow: true, rotation: { x: 0, y: 0, z: 0 }
        }
        let shaderSphereGeom = this.w.genSphereGeom(sphereCfg);
    
        let torusCfg = {
            radius: 32, tube: 16, radialSegments: 128, tubularSegments: 64, arc: 2 * Math.PI
        }
        let shaderTorusGeom = this.w.genTorusGeom(torusCfg);
    
        let cylinderCfg = {
            radiusTop: 24, radiusBottom: 24, height: 64, radiusSegments: 128, heightSegments: 1, openEnded: false, color: "#3D7D96"
        }
        let cylinderGeom = this.w.genCylinderGeom(cylinderCfg);
        
        let planeCfg = {
            width: 120, height: 45, widthSegments: 1, heightSegments: 1, color: Math.random() * 0xFFFFFF, position: { x: 0, y: 0, z: 0 },
            receiveShadow: true
        }
        let planeGeom = this.w.genPlaneGeom(planeCfg);
    
        let circleCfg = {
            radius: 64, segments: 32, color: Math.random() * 0xFFFFFF, wireframe: false, position: { x: 20, y: 4, z: 2 },
            castShadow: true, rotation: { x: 0, y: 0, z: 0 }
        }
        let circleGeom = this.w.genCircleGeom(circleCfg);
    
        let shaderGeoms = [shaderCubeGeom, shaderSphereGeom, shaderTorusGeom, cylinderGeom, planeGeom/*, circleCfg*/];
    
        this.uniforms1 = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            texture: null
        };
    
        let loader = new THREE.TextureLoader();
	    let texture2 = loader.load('assets/textures/chrome.png');

        this.uniforms2 = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            texture: { type: "t", value: texture2 } 
        };

	    let texture3 = loader.load('assets/textures/lavatile.jpg');

        this.uniforms3 = {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: new THREE.Vector2() },
            texture: { type: "t", value: texture3 }
        };
    
        this.uniforms2.texture.value.wrapS = this.uniforms2.texture.value.wrapT 
            = this.uniforms3.texture.value.wrapS = this.uniforms3.texture.value.wrapT 
            = THREE.RepeatWrapping;
    
        let params = [
            [ 'fragmentShader1', this.uniforms1 ],
            [ 'fragmentShader2', this.uniforms2 ],
            [ 'fragmentShader3', this.uniforms1 ],
            [ 'fragmentShader4', this.uniforms1 ],
            [ 'fragmentShader5', this.uniforms3 ]
        ];
            
        for(let i = 0; i < params.length; i++) {
            let shaderMesh = this.createShaderMesh(shaderGeoms[i], "vertexShader", params[i][0], params[i][1]);
            let matIndex = i; // this.getRandomInt(0, params.length - 1);
            let mat = this.w.genShaderMaterial({ vertexShaderId: 'vertexShader', fragmentShaderId: params[matIndex][0], uniforms: params[matIndex][1], attributes: {} });
            shaderMesh.material = mat;
            let geomIndex = i; // this.getRandomInt(0, shaderGeoms.length - 1);
            let geom = shaderGeoms[geomIndex];
            shaderMesh.geometry = geom;
        }
    
    }

    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    private adjustUniforms() {
        let delta = this.clock.getDelta();

        this.uniforms1.time.value += delta * 5;
        this.uniforms2.time.value = this.clock.elapsedTime;
        this.uniforms3.time.value = this.clock.elapsedTime;
    
    }        
}

