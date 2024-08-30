uniform vec3 diffuse;

varying float vFinalStep;
varying vec2 vUv;
varying vec3 vColor;

void main() {
  if(length(vUv - 0.5) > 0.5)
    discard;

  float circle = clamp(length(vUv - 0.5) / 0.5, 0.0, 1.0);

  vec3 gradient = mix(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), circle);

  vec3 color = mix(diffuse, vColor, vFinalStep);

  color = mix(color, gradient, vFinalStep);

  gl_FragColor = vec4(color, 1.0);

}