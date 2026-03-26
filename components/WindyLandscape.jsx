'use client';

import { useEffect, useRef } from 'react';

/* ── Vertex shader: passes position + UV to fragment stage ── */
const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
  v_uv = a_uv;
}
`;

/* ── Fragment shader: gentle multi-frequency wind displacement ── */
const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_strength;
varying vec2 v_uv;

void main() {
  // v_uv.y: 0 = ground/roots (bottom of image), 1 = sky (top of image)
  // Wind mask peaks around the mid-lower area (grass blades / tips),
  // fades toward roots (y~0) and sky (y~1).
  float mask = smoothstep(0.0, 0.28, v_uv.y)   // fade in from roots
             * smoothstep(0.75, 0.48, v_uv.y);  // fade out toward sky

  // Three overlapping sinusoids at different spatial & temporal frequencies
  // for an organic, non-mechanical sway.
  float w = sin(v_uv.x * 3.8  + u_time * 0.62)         * 0.50
          + sin(v_uv.x * 8.4  + u_time * 1.05 + 2.1)   * 0.28
          + sin(v_uv.x * 1.55 + u_time * 0.36 + 4.3)   * 0.22;

  // Max displacement ~3.5 UV units per 1000 px width — extremely subtle
  float dx = w * 0.0035 * mask * u_strength;
  vec2 uv = clamp(v_uv + vec2(dx, 0.0), 0.001, 0.999);

  gl_FragColor = texture2D(u_tex, uv);
}
`;

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/**
 * WindyLandscape
 * Renders an image via WebGL with a subtle grass-wind displacement effect.
 * Replicates `objectFit: contain; objectPosition: center bottom` exactly.
 */
export default function WindyLandscape({ src, style, className, aspectRatio = 0, mobileAspectRatio = 1.0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return;

    /* ── Program ── */
    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const aPos     = gl.getAttribLocation(prog, 'a_pos');
    const aUv      = gl.getAttribLocation(prog, 'a_uv');
    const uTime    = gl.getUniformLocation(prog, 'u_time');
    const uStrength = gl.getUniformLocation(prog, 'u_strength');
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0);
    gl.uniform1f(uStrength, prefersReduced ? 0.0 : 1.0);

    /* ── Buffers ── */
    const posBuf = gl.createBuffer();
    const uvBuf  = gl.createBuffer();

    let imgW = 0, imgH = 0;
    let animId = null;
    let startTime = null;

    /**
     * Desktop (≥768 px): contain + bottom-align — image fits full width,
     *   sits in the lower part of the hero as originally designed.
     * Mobile (<768 px): cover — image fills the full viewport so it's
     *   always visible regardless of portrait orientation.
     * NDC: x ∈ [-1,1] left→right, y ∈ [-1,1] bottom→top.
     */
    function buildQuad() {
      if (!imgW || !imgH) return;
      const cw = canvas.width;
      const ch = canvas.height;
      // Desktop : width-fill — l'image remplit 100% de la largeur, hauteur libre.
      // Avec top:0 sur le canvas (pleine hauteur hero), l'image ne déborde jamais en haut → aucun clipping WebGL.
      // Mobile (< 1025px) : cover — remplit le canvas en hauteur et largeur pour rester visible en portrait.
      const cssWidth = canvas.parentElement?.getBoundingClientRect().width ?? (cw / (window.devicePixelRatio || 1));
      const scale = cssWidth < 1025
        ? Math.max(cw / imgW, ch / imgH)  // cover
        : cw / imgW;                       // width-fill
      const sw = imgW * scale; // scaled image pixel width
      const sh = imgH * scale; // scaled image pixel height

      // NDC x: centered; y: bottom-aligned
      const x0 = -(sw / cw);
      const x1 =  (sw / cw);
      const y0 = -1.0;
      const y1 = 2.0 * (sh / ch) - 1.0;

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x0, y0,  x1, y0,  x0, y1,  x1, y1,
      ]), gl.DYNAMIC_DRAW);

      // UV: UNPACK_FLIP_Y_WEBGL=true → (0,0)=bottom-left=ground, (1,1)=top-right=sky
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,  1, 0,  0, 1,  1, 1,
      ]), gl.DYNAMIC_DRAW);
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let aspect;
      const dynamicAspect = 1.0 + Math.pow(Math.max(0, (width - 400) / 1600), 0.47) * 0.8;
      if (width < 1025) {
        aspect = mobileAspectRatio === 0 ? dynamicAspect : mobileAspectRatio;
      } else if (aspectRatio < 0) {
        aspect = Math.abs(aspectRatio);
      } else {
        aspect = 1.0 + Math.pow(Math.max(0, (width - 400) / 1600), 0.47) * 0.8 - aspectRatio;
      }
      canvas.width  = Math.round(width * dpr);
      canvas.height = Math.round(width * dpr / aspect);
      gl.viewport(0, 0, canvas.width, canvas.height);
      buildQuad();
    }

    /* ── Texture ── */
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    let texture = null;

    img.onload = () => {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;

      // Downscale if image exceeds MAX_TEXTURE_SIZE (e.g. ocean.png is 5000px wide)
      const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      let source = img;
      if (imgW > maxSize || imgH > maxSize) {
        const scale = Math.min(maxSize / imgW, maxSize / imgH);
        const oc = document.createElement('canvas');
        oc.width  = Math.floor(imgW * scale);
        oc.height = Math.floor(imgH * scale);
        oc.getContext('2d').drawImage(img, 0, 0, oc.width, oc.height);
        source = oc;
      }

      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Flip Y so UV (0,0) = bottom of image (ground level)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      resize();

      let lastFrame = 0;
      const FRAME_INTERVAL = 1000 / 30; // 30fps

      function render(ts) {
        animId = requestAnimationFrame(render);
        if (ts - lastFrame < FRAME_INTERVAL) return;
        lastFrame = ts;

        if (!startTime) startTime = ts;
        const t = (ts - startTime) / 1000.0;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uTime, t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      animId = requestAnimationFrame(render);
    };

    /* ── Resize observer ── */
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      if (texture) gl.deleteTexture(texture);
      gl.deleteProgram(prog);
    };
  }, [src, aspectRatio, mobileAspectRatio]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: 'transparent',
        ...style,
      }}
    />
  );
}
