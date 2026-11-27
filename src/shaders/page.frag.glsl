#version 300 es
precision highp float;

uniform sampler2D u_pageTex;
uniform float u_opacity;
uniform vec3 u_lightPos;

in vec2 v_uv;
in vec3 v_worldPos;
in vec3 v_normal;

out vec4 fragColor;

const vec3 BACK_PAPER_COLOR = vec3(0.9922, 0.9843, 0.9686);

void main() {
  vec3 N = normalize(v_normal);
  if (!gl_FrontFacing) {
    N = -N;
  }

  vec3 L = normalize(u_lightPos - v_worldPos);
  float ndotl = max(dot(N, L), 0.0);
  float shade = 0.55 + 0.45 * ndotl;

  vec4 tex = texture(u_pageTex, v_uv);
  vec4 base = gl_FrontFacing ? tex : vec4(BACK_PAPER_COLOR * tex.a, tex.a);
  fragColor = vec4(base.rgb * shade, base.a) * u_opacity;
}
