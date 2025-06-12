varying vec3 vUv;

uniform float u_time;
uniform float u_amplitude;
uniform float[64] u_data_arr;

void main() {
  vUv = position;

  //From -64 to +64 → normalize to 0–63
  float norm_x = (position.x + 64.0) / 128.0 * 63.0;
  int index = int(clamp(norm_x, 0.0, 63.0));

  float dist = length(vec2(position.x, position.y)); // radial distance from center
  float falloff = 1.0 - dist / 90.0; // adjust radius as needed
  falloff = clamp(falloff, 0.0, 1.0);

  float height = u_data_arr[index] / 127.0; // Normalize
  float z = height * u_amplitude * falloff * 5.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
}
