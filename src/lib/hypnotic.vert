varying float x;
varying float y;
varying float z;

uniform float u_time;
uniform float[64] u_data_arr;

const float frequency = 0.3;

void main() {
  float z = sin(abs(position.x) * frequency + abs(position.y) * frequency + u_time * .002);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
}
