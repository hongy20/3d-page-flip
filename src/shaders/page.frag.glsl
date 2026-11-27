#version 300 es
precision highp float;

uniform sampler2D u_pageTex;
uniform float u_opacity;

in vec2 v_uv;

out vec4 fragColor;

void main() {
  fragColor = texture(u_pageTex, v_uv) * u_opacity;
}
