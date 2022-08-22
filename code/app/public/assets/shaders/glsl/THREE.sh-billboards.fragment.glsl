		precision highp float;

		uniform sampler2D map;

		varying vec2 vUv;
		varying vec3 vColor;

		void main() {

			vec4 diffuseColor = texture2D( map, vUv );
			gl_FragColor = vec4( diffuseColor.xyz * vColor, diffuseColor.w );

			if ( diffuseColor.w < 0.5 ) discard;

		}
