struct Impact {
  vec3 impactPosition;
  float impactMaxRadius;
  float impactRatio;
};

uniform Impact impacts[10];
uniform vec3 phenomenonColor;

attribute vec3 center;
attribute float scale;

varying float vFinalStep;
varying vec3 vColor;
varying vec2 vUv;

void main() {
  vec3 transformedPosition = position;

  float finalStep = 0.0;

  vUv = uv;

  for(int i = 0; i < 10; i++) {
    float dist = distance(center, impacts[i].impactPosition);

    float curRadius = impacts[i].impactMaxRadius * impacts[i].impactRatio;

    float stepValue = smoothstep(0., curRadius, dist) - smoothstep(curRadius - (0.25 * impacts[i].impactRatio), curRadius, dist);

    stepValue *= 1.0 - impacts[i].impactRatio;

    finalStep += stepValue;
  }

  finalStep = clamp(finalStep, 0.0, 1.0);

  vFinalStep = finalStep;

  vColor = phenomenonColor;

  transformedPosition = (transformedPosition - center) * mix(1.0, scale * 1.25, finalStep) + center;

  transformedPosition += normal * finalStep * 0.2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
}