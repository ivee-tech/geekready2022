		precision highp float;
		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;
		attribute vec3 normal;

		attribute vec3 translate;
		attribute float scale;
		attribute vec3 color;

		varying vec2 vUv;
		varying vec3 vColor;

		void main() {

			vec4 mvPosition = modelViewMatrix * vec4( translate, 1.0 );

			mvPosition.xyz += position * scale;

			vUv = uv;
			vColor = color;

			gl_Position = projectionMatrix * mvPosition;

		}
