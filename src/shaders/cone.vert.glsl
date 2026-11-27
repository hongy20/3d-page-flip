#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_theta;
uniform float u_Ay;
uniform float u_rho;
uniform float u_zBias;

out vec2 v_uv;
out vec3 v_worldPos;
out vec3 v_normal;

vec3 coneDeform(vec2 p) {
  float dy = p.y - u_Ay;
  float R = length(vec2(p.x, dy));
  float sinTheta = sin(u_theta);
  float cosTheta = cos(u_theta);
  float alpha = asin(clamp(p.x / R, -1.0, 1.0));
  float beta = alpha / sinTheta;
  float r = R * sinTheta;
  float sinHalfBeta = sin(0.5 * beta);
  float oneMinusCosBeta = 2.0 * sinHalfBeta * sinHalfBeta;

  float Tx = r * sin(beta);
  // Cancellation-safe R + Ay = p.y + p.x^2 / (R + (p.y - u_Ay)).
  float Ty = p.y + (p.x * p.x) / (R + dy) - r * oneMinusCosBeta * sinTheta;
  float Tz = r * oneMinusCosBeta * cosTheta;

  float cosRho = cos(u_rho);
  float sinRho = sin(u_rho);
  return vec3(
    Tx * cosRho - Tz * sinRho,
    Ty,
    Tx * sinRho + Tz * cosRho
  );
}

void main() {
  vec3 pos = coneDeform(a_position);
  const float EPS = 5e-3;
  vec3 dVdx = coneDeform(a_position + vec2(EPS, 0.0)) - coneDeform(a_position - vec2(EPS, 0.0));
  vec3 dVdy = coneDeform(a_position + vec2(0.0, EPS)) - coneDeform(a_position - vec2(0.0, EPS));
  v_normal = normalize(cross(dVdx, dVdy));

  pos.z += u_zBias;
  vec4 worldPos = u_model * vec4(pos, 1.0);
  v_worldPos = worldPos.xyz;
  v_uv = a_uv;
  gl_Position = u_mvp * vec4(pos, 1.0);
}
