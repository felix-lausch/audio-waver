export const vertexShader = `
  varying float x;
  varying float y;
  varying float z;
  varying vec3 vUv;

  uniform float u_time;
  uniform float u_amplitude;
  uniform float[64] u_data_arr;

  void main() {
    vUv = position;

    x = abs(position.x);
    y = abs(position.y);

    float floor_x = round(x);
    float floor_y = round(y);

    float x_multiplier = (32.0 - x) / 8.0;
    float y_multiplier = (32.0 - y) / 8.0;

    z = sin(u_data_arr[int(floor_x)] / 50.0 + u_data_arr[int(floor_y)] / 50.0) * u_amplitude;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
  }`;

export const hypnoticVertexShader = `
  varying float x;
  varying float y;
  varying float z;

  uniform float u_time;
  uniform float[64] u_data_arr;

  void main() {
    float z = sin(abs(position.x) + abs(position.y) + u_time * .003);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
  }`;

export const fragmentShader = `
  varying float x;
  varying float y;
  varying float z;
  varying vec3 vUv;

  uniform float u_time;

  void main() {
    gl_FragColor = vec4((32.0 - abs(x)) / 32.0, (32.0 - abs(y)) / 32.0, (abs(x + y) / 2.0) / 32.0, 1.0);
  }`;

export const pulsatingFragmentShader = `
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
  }`;