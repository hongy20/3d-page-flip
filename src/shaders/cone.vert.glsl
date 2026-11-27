#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_theta;
uniform float u_Ay;
uniform float u_rho;
uniform float u_conicContribution;
uniform float u_cylKappa;
uniform float u_pageHeight;
uniform float u_zBias;

out vec2 v_uv;
out vec3 v_worldPos;
out vec3 v_normal;

const float KAPPA_EPS = 1e-4;

vec3 coneLocal(vec2 p) {
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

  return vec3(Tx, Ty, Tz);
}

vec3 topConeLocal(vec2 p) {
  vec3 mirrored = coneLocal(vec2(p.x, u_pageHeight - p.y));
  return vec3(mirrored.x, u_pageHeight - mirrored.y, mirrored.z);
}

vec3 cylLocal(vec2 p) {
  float k = max(0.0, u_cylKappa);
  float phi = k * p.x;
  float Tx;
  float Tz;

  if (k > KAPPA_EPS) {
    float sinHalfPhi = sin(0.5 * phi);
    Tx = sin(phi) / k;
    Tz = (2.0 * sinHalfPhi * sinHalfPhi) / k;
  } else {
    Tx = p.x * (1.0 - (phi * phi) / 6.0);
    Tz = 0.5 * p.x * phi;
  }

  return vec3(Tx, p.y, Tz);
}

vec3 curlDeform(vec2 p) {
  float c = clamp(u_conicContribution, -1.0, 1.0);
  vec3 cyl = cylLocal(p);
  vec3 cone = c < 0.0 ? topConeLocal(p) : coneLocal(p);
  vec3 localPos = mix(cyl, cone, abs(c));

  float cosRho = cos(u_rho);
  float sinRho = sin(u_rho);
  return vec3(
    localPos.x * cosRho - localPos.z * sinRho,
    localPos.y,
    localPos.x * sinRho + localPos.z * cosRho
  );
}

void main() {
  vec3 pos = curlDeform(a_position);
  const float EPS = 5e-3;
  vec3 dVdx = curlDeform(a_position + vec2(EPS, 0.0)) - curlDeform(a_position - vec2(EPS, 0.0));
  vec3 dVdy = curlDeform(a_position + vec2(0.0, EPS)) - curlDeform(a_position - vec2(0.0, EPS));
  v_normal = normalize(cross(dVdx, dVdy));

  pos.z += u_zBias;
  vec4 worldPos = u_model * vec4(pos, 1.0);
  v_worldPos = worldPos.xyz;
  v_uv = a_uv;
  gl_Position = u_mvp * vec4(pos, 1.0);
}
