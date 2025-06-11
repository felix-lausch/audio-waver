varying float x;
varying float y;
varying float z;
varying vec3 vUv;

uniform float u_time;

// float adjust_range(float x) {
//   return 0.5 * (sin(x) + 1.0);
// }

float adjust_range(float x) {
  return abs(sin(x));
}

float random (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.545);
}

void main() {
  float time_factor = 0.0005;

  // float r = 0.5 * (sin(u_time * time_factor) + 1.0);
  // float g = 0.5 * (sin(u_time * time_factor) + 1.0);
  // float b = 0.5 * (sin(u_time * time_factor) + 1.0);

  float time = u_time * time_factor;

  float r = adjust_range(time + random(vec2(1.0, 5.0)));
  float g = adjust_range(time + random(vec2(45.0, 45.0)));
  float b = adjust_range(time + random(vec2(9.0, 0.0)));

  gl_FragColor = vec4(r, g, b, 1.0);
}