varying float x;
varying float y;
varying float z;
varying vec3 vUv;

uniform float u_time;
uniform float[128] u_data_arr;
uniform float u_amplitude;

void main() {
  vUv = position;

  x = abs(position.x);
  y = abs(position.y);
  z = abs(position.z);

  float shifted_x = x + 0.0;
  float shifted_y = y + 0.0;
  float shifted_z = z + 0.0;

  float amplitude_at_x = u_data_arr[int(shifted_x)];
  float amplitude_at_y = u_data_arr[int(shifted_y)];

  float z = ((amplitude_at_x - 127.0) + (amplitude_at_y - 127.0)) * u_amplitude;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
}