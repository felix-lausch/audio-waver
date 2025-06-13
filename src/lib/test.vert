// uniform float u_amplitude;
// uniform float[64] u_data_arr;

//attribute are geometry properties in three js and get automatically populated in glsl
//each attribute is vertex specific
// attribute vec3 position;

//uniforms are material properties, they are the same for every vertex
//and are also available in the fragment shader
// uniform mat4 projectionMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 modelMatrix;
// uniform mat4 viewMatrix;

// Transform -> position, scale, rotation
// modelMatrix -> position, scale, rotation of our model
// viewMatrix -> position, orientation of our camera
// projectionMatrix -> projects our object onto the screen (aspect ratio & the perspective)

uniform float u_time;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vPosition = position;
  vNormal = normal;
  vUv = uv;

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

  //MVP
  gl_Position = projectionMatrix * modelViewPosition;
}
