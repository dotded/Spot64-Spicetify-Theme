(() => {
    'use strict';
    if (window.__spot64DitherExtensionLoaded)
        return;
    window.__spot64DitherExtensionLoaded = true;
    const KEY = 'spot64.dither.customize.v1';
    const DEFAULTS = Object.freeze({
        enabled: true, gradientStyle: 3, ditherStyle: 0, ditherSize: 5, ditherOpacity: 1,
        speed: 0.1, parallaxEnabled: false, parallaxStrength: 0.20, colors: ['#000000', '#0d0c0c'], matchTheme: true,
        effect: 0, effectStrength: 0.40, effectRadius: 0.45, effectSmoothing: 0.50,
        clickEffect: 0, clickStrength: 0.55, imageOpacity: 0.8, imageScale: 1
    });
    const clamp = (value, min, max, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
    };
    const hex = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
    const normalized = (data) => ({
        ...DEFAULTS,
        enabled: typeof data?.enabled === 'boolean' ? data.enabled : DEFAULTS.enabled,
        gradientStyle: Math.round(clamp(data?.gradientStyle, 0, 9, DEFAULTS.gradientStyle)),
        ditherStyle: Math.round(clamp(data?.ditherStyle, 0, 7, DEFAULTS.ditherStyle)),
        ditherSize: Math.round(clamp(data?.ditherSize, 1, 24, DEFAULTS.ditherSize)),
        ditherOpacity: clamp(data?.ditherOpacity, 0, 1, DEFAULTS.ditherOpacity),
        speed: clamp(data?.speed, 0, 1, DEFAULTS.speed),
        matchTheme: typeof data?.matchTheme === 'boolean' ? data.matchTheme : DEFAULTS.matchTheme,
        parallaxEnabled: typeof data?.parallaxEnabled === 'boolean' ? data.parallaxEnabled : DEFAULTS.parallaxEnabled,
        parallaxStrength: clamp(data?.parallaxStrength, 0, 1, DEFAULTS.parallaxStrength),
        effect: Math.round(clamp(data?.effect, 0, 33, DEFAULTS.effect)),
        effectStrength: clamp(data?.effectStrength, 0, 1, DEFAULTS.effectStrength),
        effectRadius: clamp(data?.effectRadius, 0, 1, DEFAULTS.effectRadius),
        effectSmoothing: clamp(data?.effectSmoothing, 0, 1, DEFAULTS.effectSmoothing),
        clickEffect: Math.round(clamp(data?.clickEffect, 0, 3, DEFAULTS.clickEffect)),
        clickStrength: clamp(data?.clickStrength, 0, 1, DEFAULTS.clickStrength),
        colors: [hex(data?.colors?.[0], DEFAULTS.colors[0]), hex(data?.colors?.[1], DEFAULTS.colors[1])]
    });
    let stored = {};
    try {
        stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    }
    catch (_) { }
    let CONFIG = normalized(stored);
    let instance = null;
    let themeColors = null;
    function cssHex(value) {
        const s = String(value || '').trim();
        if (/^#[0-9a-f]{6}$/i.test(s))
            return s.toLowerCase();
        if (/^#[0-9a-f]{3}$/i.test(s))
            return '#' + s.slice(1).split('').map(c => c + c).join('').toLowerCase();
        const match = /^rgba?\(\s*(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})(?:\s*[,/]\s*([\d.]+))?\s*\)$/i.exec(s);
        if (!match || match.slice(1, 4).some(v => Number(v) > 255) || (match[4] !== undefined && Number(match[4]) <= 0))
            return '';
        return '#' + match.slice(1, 4).map(v => Number(v).toString(16).padStart(2, '0')).join('');
    }
    function mixColors(base, accent, amount) {
        const a = [1, 3, 5].map(i => parseInt(base.slice(i, i + 2), 16));
        const b = [1, 3, 5].map(i => parseInt(accent.slice(i, i + 2), 16));
        return '#' + a.map((n, i) => Math.round(n * (1 - amount) + b[i] * amount).toString(16).padStart(2, '0')).join('');
    }
    function readThemeColors(root) {
        if (!root?.isConnected)
            return null;
        const rootCSS = getComputedStyle(root);
        const heading = root.querySelector('.tm-title');
        const headingCSS = heading ? getComputedStyle(heading) : rootCSS;
        const base = cssHex(rootCSS.getPropertyValue('--spot64-dither-dark')) ||
            cssHex(rootCSS.backgroundColor) ||
            cssHex(rootCSS.getPropertyValue('--spot64-ui-main')) || '#101112';
        const accent = cssHex(headingCSS.color) ||
            cssHex(rootCSS.getPropertyValue('--spot64-ui-heading')) ||
            cssHex(rootCSS.color) || '#95b9b2';
        const wave = cssHex(rootCSS.getPropertyValue('--spot64-dither-light')) || mixColors(base, accent, .20);
        return [base, wave];
    }
    function activeColors() { return CONFIG.matchTheme && themeColors ? themeColors : CONFIG.colors; }
    function syncColorPickers() {
        const dark = document.getElementById('spot64-dither-dark');
        const light = document.getElementById('spot64-dither-light');
        const automatic = document.getElementById('spot64-dither-match-theme');
        if (automatic)
            automatic.checked = CONFIG.matchTheme;
        const colors = activeColors();
        for (const [picker, value] of [[dark, colors[0]], [light, colors[1]]]) {
            if (!picker)
                continue;
            picker.disabled = CONFIG.matchTheme;
            if (picker.value !== value)
                picker.value = value;
        }
    }
    function refreshThemeColors(root) {
        if (!CONFIG.matchTheme) {
            syncColorPickers();
            return;
        }
        const colors = readThemeColors(root || document.getElementById('tm-root'));
        if (colors && (!themeColors || colors[0] !== themeColors[0] || colors[1] !== themeColors[1])) {
            themeColors = colors;
            syncColorPickers();
        }
    }
    const saveSettings = () => {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                enabled: CONFIG.enabled, gradientStyle: CONFIG.gradientStyle,
                ditherStyle: CONFIG.ditherStyle, ditherSize: CONFIG.ditherSize,
                ditherOpacity: CONFIG.ditherOpacity, speed: CONFIG.speed, colors: CONFIG.colors,
                matchTheme: CONFIG.matchTheme, parallaxEnabled: CONFIG.parallaxEnabled,
                parallaxStrength: CONFIG.parallaxStrength,
                effect: CONFIG.effect, effectStrength: CONFIG.effectStrength,
                effectRadius: CONFIG.effectRadius, effectSmoothing: CONFIG.effectSmoothing,
                clickEffect: CONFIG.clickEffect, clickStrength: CONFIG.clickStrength
            }));
        }
        catch (_) { }
        if (instance) {
            instance.layer.dataset.disabled = String(!CONFIG.enabled);
            if (CONFIG.enabled)
                instance.wake();
        }
        refreshThemeColors();
        syncColorPickers();
    };
    const EMBEDDED_IMAGE = null;
    const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
    const legacyFragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uParallaxStrength;
  uniform float uTime;
  uniform float uSpeed;
  uniform int uGradientStyle;
  uniform int uDitherStyle;
  uniform float uDitherSize;
  uniform float uDitherOpacity;
  uniform int uColorCount;
  uniform vec3 uColors[8];

  // Image uniforms
  uniform sampler2D uImage;
  uniform vec2 uImageResolution;
  uniform float uImageOpacity;
  uniform float uImageScale;
  uniform bool uHasImage;

  // Bayer 8x8 matrix
  float bayer8x8(vec2 pos) {
    int x = int(mod(pos.x, 8.0));
    int y = int(mod(pos.y, 8.0));
    int index = x + y * 8;
    float bayer[64];
    bayer[0] = 0.0; bayer[1] = 32.0; bayer[2] = 8.0; bayer[3] = 40.0; bayer[4] = 2.0; bayer[5] = 34.0; bayer[6] = 10.0; bayer[7] = 42.0;
    bayer[8] = 48.0; bayer[9] = 16.0; bayer[10] = 56.0; bayer[11] = 24.0; bayer[12] = 50.0; bayer[13] = 18.0; bayer[14] = 58.0; bayer[15] = 26.0;
    bayer[16] = 12.0; bayer[17] = 44.0; bayer[18] = 4.0; bayer[19] = 36.0; bayer[20] = 14.0; bayer[21] = 46.0; bayer[22] = 6.0; bayer[23] = 38.0;
    bayer[24] = 60.0; bayer[25] = 28.0; bayer[26] = 52.0; bayer[27] = 20.0; bayer[28] = 62.0; bayer[29] = 30.0; bayer[30] = 54.0; bayer[31] = 22.0;
    bayer[32] = 3.0; bayer[33] = 35.0; bayer[34] = 11.0; bayer[35] = 43.0; bayer[36] = 1.0; bayer[37] = 33.0; bayer[38] = 9.0; bayer[39] = 41.0;
    bayer[40] = 51.0; bayer[41] = 19.0; bayer[42] = 59.0; bayer[43] = 27.0; bayer[44] = 49.0; bayer[45] = 17.0; bayer[46] = 57.0; bayer[47] = 25.0;
    bayer[48] = 15.0; bayer[49] = 47.0; bayer[50] = 7.0; bayer[51] = 39.0; bayer[52] = 13.0; bayer[53] = 45.0; bayer[54] = 5.0; bayer[55] = 37.0;
    bayer[56] = 63.0; bayer[57] = 31.0; bayer[58] = 55.0; bayer[59] = 23.0; bayer[60] = 61.0; bayer[61] = 29.0; bayer[62] = 53.0; bayer[63] = 21.0;
    for (int i = 0; i < 64; i++) { if (i == index) return bayer[i] / 64.0; }
    return 0.0;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float blueNoise(vec2 pos) { float n = 0.0; n += hash(pos) * 0.5; n += hash(pos * 2.0 + 100.0) * 0.25; n += hash(pos * 4.0 + 200.0) * 0.125; return fract(n * 2.0); }
  float halftone(vec2 pos, float value) { vec2 center = floor(pos) + 0.5; float dist = length(pos - center); float radius = sqrt(value) * 0.7; return step(dist, radius); }
  float linePattern(vec2 pos, float angle) { float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c); return fract(rotated.x); }
  float bayer4x4(vec2 pos) { int x = int(mod(pos.x, 4.0)); int y = int(mod(pos.y, 4.0)); int index = x + y * 4; float bayer[16]; bayer[0]=0.0; bayer[1]=8.0; bayer[2]=2.0; bayer[3]=10.0; bayer[4]=12.0; bayer[5]=4.0; bayer[6]=14.0; bayer[7]=6.0; bayer[8]=3.0; bayer[9]=11.0; bayer[10]=1.0; bayer[11]=9.0; bayer[12]=15.0; bayer[13]=7.0; bayer[14]=13.0; bayer[15]=5.0; for (int i = 0; i < 16; i++) { if (i == index) return bayer[i] / 16.0; } return 0.0; }
  float ign(vec2 pos) { return fract(52.9829189 * fract(0.06711056 * pos.x + 0.00583715 * pos.y)); }
  float rings(vec2 pos) { vec2 center = floor(pos) + 0.5; return fract(length(pos - center) * 2.0); }

  // Gradient Functions
  float wavyGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 4.0 + time) * 0.3; v += cos(uv.y * 3.0 - time * 0.7) * 0.3; v += sin((uv.x + uv.y) * 5.0 + time * 1.3) * 0.2; v += cos(uv.x * 2.0 - uv.y * 3.0 + time * 0.5) * 0.2; return v * 0.5 + 0.5; }
  float radialGradient(vec2 uv, float time) { vec2 center = vec2(0.5 + sin(time * 0.5) * 0.2, 0.5 + cos(time * 0.3) * 0.2); float dist = length(uv - center); return sin(dist * 8.0 - time * 2.0) * 0.5 + 0.5; }
  float diagonalGradient(vec2 uv, float time) { float angle = time * 0.2; float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c); return sin(rotated.x * 6.0 + rotated.y * 2.0 + time) * 0.5 + 0.5; }
  float noiseGradient(vec2 uv, float time) { vec2 p = uv * 3.0; float n = 0.0; n += sin(p.x + time) * cos(p.y + time * 0.7); n += sin(p.x * 2.1 - time * 0.8) * cos(p.y * 1.9 + time * 0.6) * 0.5; n += sin(p.x * 3.3 + time * 1.1) * cos(p.y * 2.8 - time * 0.9) * 0.25; return n * 0.3 + 0.5; }
  float plasmaGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 10.0 + time); v += sin(uv.y * 10.0 + time * 1.2); v += sin((uv.x + uv.y) * 10.0 + time * 1.5); v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time); return v * 0.125 + 0.5; }
  float spiralGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float r = length(pos); float a = atan(pos.y, pos.x); return sin(r * 20.0 + a * 3.0 - time * 3.0) * 0.5 + 0.5; }
  float squareGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = abs(uv - center); float d = max(pos.x, pos.y); return sin(d * 15.0 - time * 2.0) * 0.5 + 0.5; }
  float zigzagGradient(vec2 uv, float time) { vec2 pos = uv * 5.0; float v = pos.y + sin(pos.x * 2.0 + time) * 0.5; return sin(v * 4.0 + time) * 0.5 + 0.5; }
  float swirlGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float len = length(pos); float ang = atan(pos.y, pos.x); ang += len * 8.0 - time; return sin(ang * 4.0) * 0.5 + 0.5; }
  float auroraGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 3.0 + time * 0.5) * 0.5; v += sin(uv.x * 5.0 + uv.y * 2.0 + time * 0.8) * 0.3; v += sin(uv.x * 8.0 - time * 0.3) * 0.2; float y = uv.y + sin(uv.x * 2.0 + time) * 0.1; return sin(y * 5.0 + v * 5.0) * 0.5 + 0.5; }

  // UV Cover Logic
  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imgRes) {
    float screenAspect = screenRes.x / screenRes.y;
    float imgAspect = imgRes.x / imgRes.y;

    vec2 scale = vec2(1.0);

    if (screenAspect > imgAspect) {
      scale = vec2(1.0, imgAspect / screenAspect);
    } else {
      scale = vec2(screenAspect / imgAspect, 1.0);
    }

    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    // Shift both the gradient and Bayer grid together, so the dither texture
    // visibly follows the pointer without changing its animation or palette.
    vec2 parallaxOffset = uPointer * uParallaxStrength * 0.18;
    uv += parallaxOffset;
    float time = uTime * uSpeed;

    // 1. GENERATE BASE GRADIENT (this will show through transparent areas)
    float gradient = 0.0;
    if (uGradientStyle == 0) gradient = wavyGradient(uv, time);
    else if (uGradientStyle == 1) gradient = radialGradient(uv, time);
    else if (uGradientStyle == 2) gradient = diagonalGradient(uv, time);
    else if (uGradientStyle == 3) gradient = noiseGradient(uv, time);
    else if (uGradientStyle == 4) gradient = plasmaGradient(uv, time);
    else if (uGradientStyle == 5) gradient = spiralGradient(uv, time);
    else if (uGradientStyle == 6) gradient = squareGradient(uv, time);
    else if (uGradientStyle == 7) gradient = zigzagGradient(uv, time);
    else if (uGradientStyle == 8) gradient = swirlGradient(uv, time);
    else if (uGradientStyle == 9) gradient = auroraGradient(uv, time);

    gradient = clamp(gradient, 0.0, 1.0);

    // Store the original gradient for transparent areas
    float baseGradient = gradient;

    // 2. APPLY IMAGE BLEND IF PRESENT
    if (uHasImage) {
        vec2 baseUV = getCoverUV(uv, uResolution, uImageResolution);
        // Apply scale relative to center (0.5)
        vec2 imgUV = (baseUV - 0.5) / uImageScale + 0.5;

        if (imgUV.x >= 0.0 && imgUV.x <= 1.0 && imgUV.y >= 0.0 && imgUV.y <= 1.0) {
           vec4 imgColor = texture2D(uImage, imgUV);
           // Get image alpha (0 = transparent, 1 = opaque)
           float imgAlpha = imgColor.a;

           // Calculate the image-affected gradient
           float luminance = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));
           float structure = smoothstep(0.0, 1.0, luminance); 
           float imageAffectedGradient = gradient * structure * 1.5;
           float blendedGradient = mix(gradient, imageAffectedGradient, uImageOpacity);

           // Use image alpha to blend between base gradient (for transparent areas)
           // and image-affected gradient (for opaque areas)
           // Transparent areas (imgAlpha = 0) get baseGradient
           // Opaque areas (imgAlpha = 1) get blendedGradient
           gradient = mix(baseGradient, blendedGradient, imgAlpha);
        }
    }

    // 3. DITHERING
    vec2 ditherPos = (gl_FragCoord.xy + parallaxOffset * uResolution) / uDitherSize;
    float threshold = 0.0;
    if (uDitherStyle == 0) threshold = bayer8x8(ditherPos);
    else if (uDitherStyle == 1) threshold = blueNoise(ditherPos);
    else if (uDitherStyle == 2) threshold = halftone(ditherPos, gradient);
    else if (uDitherStyle == 3) threshold = linePattern(ditherPos, 0.785);
    else if (uDitherStyle == 4) threshold = hash(floor(ditherPos));
    else if (uDitherStyle == 5) threshold = bayer4x4(ditherPos);
    else if (uDitherStyle == 6) threshold = ign(ditherPos);
    else if (uDitherStyle == 7) threshold = rings(ditherPos);

    // 4. COLOR MAPPING
    float scaledGradient = gradient * float(uColorCount - 1);
    int colorIndex = int(floor(scaledGradient));
    float localGradient = fract(scaledGradient);

    int nextIndex = colorIndex + 1;
    if (nextIndex >= uColorCount) nextIndex = uColorCount - 1;

    vec3 color1 = uColors[0];
    vec3 color2 = uColors[0];

    for (int i = 0; i < 8; i++) {
      if (i == colorIndex) color1 = uColors[i];
      if (i == nextIndex) color2 = uColors[i];
    }

    vec3 finalColor;
    if (uDitherStyle == 2) {
      finalColor = mix(color1, color2, threshold);
    } else {
      finalColor = localGradient > threshold ? color2 : color1;
    }

    // 5. Apply dither opacity
    gl_FragColor = vec4(finalColor, uDitherOpacity);
  }
`;
    const fragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uParallaxStrength;

  uniform int uEffect;
  uniform float uEffectStrength;
  uniform float uEffectRadius;
  uniform int uClickEffect;
  uniform float uClickStrength;
  uniform vec2 uCursor;
  uniform vec2 uVelocity;
  uniform float uPointerActive;
  uniform float uFreezeTime;
  uniform vec3 uTrail[6];  
  uniform vec3 uClicks[4]; 
  uniform float uTime;
  uniform float uSpeed;
  uniform int uGradientStyle;
  uniform int uDitherStyle;
  uniform float uDitherSize;
  uniform float uDitherOpacity;
  uniform int uColorCount;
  uniform vec3 uColors[8];


  uniform sampler2D uImage;
  uniform vec2 uImageResolution;
  uniform float uImageOpacity;
  uniform float uImageScale;
  uniform bool uHasImage;


  float bayer8x8(vec2 pos) {
    int x = int(mod(pos.x, 8.0));
    int y = int(mod(pos.y, 8.0));
    int index = x + y * 8;
    float bayer[64];
    bayer[0] = 0.0; bayer[1] = 32.0; bayer[2] = 8.0; bayer[3] = 40.0; bayer[4] = 2.0; bayer[5] = 34.0; bayer[6] = 10.0; bayer[7] = 42.0;
    bayer[8] = 48.0; bayer[9] = 16.0; bayer[10] = 56.0; bayer[11] = 24.0; bayer[12] = 50.0; bayer[13] = 18.0; bayer[14] = 58.0; bayer[15] = 26.0;
    bayer[16] = 12.0; bayer[17] = 44.0; bayer[18] = 4.0; bayer[19] = 36.0; bayer[20] = 14.0; bayer[21] = 46.0; bayer[22] = 6.0; bayer[23] = 38.0;
    bayer[24] = 60.0; bayer[25] = 28.0; bayer[26] = 52.0; bayer[27] = 20.0; bayer[28] = 62.0; bayer[29] = 30.0; bayer[30] = 54.0; bayer[31] = 22.0;
    bayer[32] = 3.0; bayer[33] = 35.0; bayer[34] = 11.0; bayer[35] = 43.0; bayer[36] = 1.0; bayer[37] = 33.0; bayer[38] = 9.0; bayer[39] = 41.0;
    bayer[40] = 51.0; bayer[41] = 19.0; bayer[42] = 59.0; bayer[43] = 27.0; bayer[44] = 49.0; bayer[45] = 17.0; bayer[46] = 57.0; bayer[47] = 25.0;
    bayer[48] = 15.0; bayer[49] = 47.0; bayer[50] = 7.0; bayer[51] = 39.0; bayer[52] = 13.0; bayer[53] = 45.0; bayer[54] = 5.0; bayer[55] = 37.0;
    bayer[56] = 63.0; bayer[57] = 31.0; bayer[58] = 55.0; bayer[59] = 23.0; bayer[60] = 61.0; bayer[61] = 29.0; bayer[62] = 53.0; bayer[63] = 21.0;
    for (int i = 0; i < 64; i++) { if (i == index) return bayer[i] / 64.0; }
    return 0.0;
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float blueNoise(vec2 pos) { float n = 0.0; n += hash(pos) * 0.5; n += hash(pos * 2.0 + 100.0) * 0.25; n += hash(pos * 4.0 + 200.0) * 0.125; return fract(n * 2.0); }
  float halftone(vec2 pos, float value) { vec2 center = floor(pos) + 0.5; float dist = length(pos - center); float radius = sqrt(value) * 0.7; return step(dist, radius); }
  float linePattern(vec2 pos, float angle) { float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c); return fract(rotated.x); }
  float bayer4x4(vec2 pos) { int x = int(mod(pos.x, 4.0)); int y = int(mod(pos.y, 4.0)); int index = x + y * 4; float bayer[16]; bayer[0]=0.0; bayer[1]=8.0; bayer[2]=2.0; bayer[3]=10.0; bayer[4]=12.0; bayer[5]=4.0; bayer[6]=14.0; bayer[7]=6.0; bayer[8]=3.0; bayer[9]=11.0; bayer[10]=1.0; bayer[11]=9.0; bayer[12]=15.0; bayer[13]=7.0; bayer[14]=13.0; bayer[15]=5.0; for (int i = 0; i < 16; i++) { if (i == index) return bayer[i] / 16.0; } return 0.0; }
  float ign(vec2 pos) { return fract(52.9829189 * fract(0.06711056 * pos.x + 0.00583715 * pos.y)); }
  float rings(vec2 pos) { vec2 center = floor(pos) + 0.5; return fract(length(pos - center) * 2.0); }


  float wavyGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 4.0 + time) * 0.3; v += cos(uv.y * 3.0 - time * 0.7) * 0.3; v += sin((uv.x + uv.y) * 5.0 + time * 1.3) * 0.2; v += cos(uv.x * 2.0 - uv.y * 3.0 + time * 0.5) * 0.2; return v * 0.5 + 0.5; }
  float radialGradient(vec2 uv, float time) { vec2 center = vec2(0.5 + sin(time * 0.5) * 0.2, 0.5 + cos(time * 0.3) * 0.2); float dist = length(uv - center); return sin(dist * 8.0 - time * 2.0) * 0.5 + 0.5; }
  float diagonalGradient(vec2 uv, float time) { float angle = time * 0.2; float c = cos(angle); float s = sin(angle); vec2 rotated = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c); return sin(rotated.x * 6.0 + rotated.y * 2.0 + time) * 0.5 + 0.5; }
  float noiseGradient(vec2 uv, float time) { vec2 p = uv * 3.0; float n = 0.0; n += sin(p.x + time) * cos(p.y + time * 0.7); n += sin(p.x * 2.1 - time * 0.8) * cos(p.y * 1.9 + time * 0.6) * 0.5; n += sin(p.x * 3.3 + time * 1.1) * cos(p.y * 2.8 - time * 0.9) * 0.25; return n * 0.3 + 0.5; }
  float plasmaGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 10.0 + time); v += sin(uv.y * 10.0 + time * 1.2); v += sin((uv.x + uv.y) * 10.0 + time * 1.5); v += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time); return v * 0.125 + 0.5; }
  float spiralGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float r = length(pos); float a = atan(pos.y, pos.x); return sin(r * 20.0 + a * 3.0 - time * 3.0) * 0.5 + 0.5; }
  float squareGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = abs(uv - center); float d = max(pos.x, pos.y); return sin(d * 15.0 - time * 2.0) * 0.5 + 0.5; }
  float zigzagGradient(vec2 uv, float time) { vec2 pos = uv * 5.0; float v = pos.y + sin(pos.x * 2.0 + time) * 0.5; return sin(v * 4.0 + time) * 0.5 + 0.5; }
  float swirlGradient(vec2 uv, float time) { vec2 center = vec2(0.5, 0.5); vec2 pos = uv - center; float len = length(pos); float ang = atan(pos.y, pos.x); ang += len * 8.0 - time; return sin(ang * 4.0) * 0.5 + 0.5; }
  float auroraGradient(vec2 uv, float time) { float v = 0.0; v += sin(uv.x * 3.0 + time * 0.5) * 0.5; v += sin(uv.x * 5.0 + uv.y * 2.0 + time * 0.8) * 0.3; v += sin(uv.x * 8.0 - time * 0.3) * 0.2; float y = uv.y + sin(uv.x * 2.0 + time) * 0.1; return sin(y * 5.0 + v * 5.0) * 0.5 + 0.5; }


  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imgRes) {
    float screenAspect = screenRes.x / screenRes.y;
    float imgAspect = imgRes.x / imgRes.y;

    vec2 scale = vec2(1.0);

    if (screenAspect > imgAspect) {
      scale = vec2(1.0, imgAspect / screenAspect);
    } else {
      scale = vec2(screenAspect / imgAspect, 1.0);
    }

    return (uv - 0.5) * scale + 0.5;
  }


  float circleMask(vec2 p,vec2 centre,float radius,float aspect) {
    float r=length((p-centre)*vec2(aspect,1.0));
    return 1.0-smoothstep(radius*0.55,radius,r);
  }
  vec2 rotate2d(vec2 p,float a) {
    return vec2(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a));
  }
  float waveAt(vec2 p,float t) {
    if(uGradientStyle==0) return wavyGradient(p,t);
    if(uGradientStyle==1) return radialGradient(p,t);
    if(uGradientStyle==2) return diagonalGradient(p,t);
    if(uGradientStyle==3) return noiseGradient(p,t);
    if(uGradientStyle==4) return plasmaGradient(p,t);
    if(uGradientStyle==5) return spiralGradient(p,t);
    if(uGradientStyle==6) return squareGradient(p,t);
    if(uGradientStyle==7) return zigzagGradient(p,t);
    if(uGradientStyle==8) return swirlGradient(p,t);
    return auroraGradient(p,t);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;


    vec2 parallaxOffset = uPointer * uParallaxStrength * 0.18;
    uv += parallaxOffset;
    float time = uTime * uSpeed;
    float aspect=uResolution.x/max(uResolution.y,1.0);
    float radius=mix(0.065,0.42,uEffectRadius);
    float power=uEffectStrength*uPointerActive;
    vec2 delta=(uv-uCursor)*vec2(aspect,1.0);
    float r=length(delta);
    float mask=1.0-smoothstep(radius*0.46,radius,r);
    float angle=atan(delta.y,delta.x);
    float phase=time*9.0;
    float localTime=time;
    float tone=0.0;
    float thresholdShift=0.0;
    float pixelScale=1.0;
    float invert=0.0;
    float split=0.0;
    float reveal=0.0;
    float edge=0.0;

    if(uEffect==1) uv+=uPointer*uEffectStrength*0.10; 
    else if(uEffect==2) uv-=delta/vec2(aspect,1.0)*(0.24*power*mask); 
    else if(uEffect==3) uv+=normalize(delta+vec2(0.0001))*sin(r*32.0-phase)*0.060*power*mask; 
    else if(uEffect==4) uv-=uVelocity*0.13*power*mask; 
    else if(uEffect==5) uv=uCursor+rotate2d(uv-uCursor,0.95*power*mask+phase*0.022*mask); 
    else if(uEffect==6) uv=uCursor+rotate2d(uv-uCursor,3.8*power*mask); 
    else if(uEffect==7) uv+=vec2(sin(uv.y*62.0+phase),cos(uv.x*52.0-phase))*0.045*power*mask; 
    else if(uEffect==8) uv+=(delta/max(r,0.003))/vec2(aspect,1.0)*sin(r*62.0-phase*1.7)*0.05*power*mask; 
    else if(uEffect==9) uv=uCursor+(uv-uCursor)*(1.0-0.68*power*mask); 
    else if(uEffect==10) uv.x+=sin(uv.y*115.0+phase*1.3)*0.029*power*mask; 
    else if(uEffect==11){ 
      float a=3.14159265/3.0;
      float theta=abs(mod(angle+a*0.5,a*2.0)-a);
      vec2 kale=vec2(cos(theta),sin(theta))*r/vec2(aspect,1.0);
      uv=mix(uv,uCursor+kale,power*mask);
    }
    else if(uEffect==12) thresholdShift=sin(r*105.0-phase)*0.35*power*mask; 
    else if(uEffect==13) uv.x+=floor(sin(floor(uv.y*82.0)*17.0+floor(time*5.0))*4.0)/130.0*power*mask; 
    else if(uEffect==14) uv=mix(uv,floor(uv*85.0)/85.0,power*mask); 
    else if(uEffect==15) tone=0.50*power*mask; 
    else if(uEffect==16) tone=0.25*power*mask; 
    else if(uEffect==17) split=power*mask; 
    else if(uEffect==18) invert=power*mask; 
    else if(uEffect==19) edge=power*mask; 
    else if(uEffect==20) reveal=power*mask; 
    else if(uEffect==21) tone=(0.23+0.22*cos(gl_FragCoord.y*2.1))*power*mask; 
    else if(uEffect==22) uv+=vec2(hash(floor(uv*160.0)+time)-0.5,hash(floor(uv.yx*180.0)-time)-0.5)*0.10*power*mask; 
    else if(uEffect==24) thresholdShift=0.44*power*mask*hash(floor(gl_FragCoord.xy/5.0)+time*0.1); 
    else if(uEffect==27) tone=0.0; 
    else if(uEffect==28) uv.x+=step(0.64,hash(vec2(floor(uv.y*95.0),floor(time*6.0))))*0.075*power*mask; 
    else if(uEffect==29) localTime=mix(time,uFreezeTime*uSpeed,power*mask); 
    else if(uEffect==30) localTime=time*(1.0+6.0*power*mask); 
    else if(uEffect==31) pixelScale=1.0+5.0*power*mask; 
    else if(uEffect==32) thresholdShift=0.42*power*mask; 
    else if(uEffect==33) tone=0.34*power*mask*(0.5+0.5*sin(phase*0.75)); 

    if(uEffect==23 || uEffect==25 || uEffect==26){
      for(int i=0;i<6;i++){
        vec3 trail=uTrail[i];
        float age=trail.z;
        if(age>=0.0 && age<1.8){
          float decay=1.0-age/1.8;
          float td=length((uv-trail.xy)*vec2(aspect,1.0));
          float tm=exp(-td*td/max(0.001,radius*radius*0.27))*decay*power;
          if(uEffect==23) tone+=tm*0.24; 
          else if(uEffect==25) uv+=normalize(uv-trail.xy+vec2(0.0001))*0.028*tm; 
          else uv+=normalize(uv-trail.xy+vec2(0.0001))*sin(td*74.0-age*12.0)*0.032*tm; 
        }
      }
    }

    float clickPower=max(uClickEffect==1 ? uClickStrength : 0.0,
                         uEffect==27 ? uEffectStrength : 0.0);
    for(int i=0;i<4;i++){
      vec3 click=uClicks[i];
      if(click.z>=0.0 && click.z<2.5){
        float dist=length((uv-click.xy)*vec2(aspect,1.0));
        float front=click.z*0.40;
        float band=exp(-pow((dist-front)/0.035,2.0))*(1.0-click.z/2.5);
        if(clickPower>0.0) uv+=normalize(uv-click.xy+vec2(0.0001))*0.050*band*clickPower;
        if(uClickEffect==2) uv+=normalize(uv-click.xy+vec2(0.0001))*0.021*sin(70.0*dist-click.z*16.0)*band*uClickStrength;
        if(uClickEffect==3) tone+=band*0.55*uClickStrength;
      }
    }


    float gradient = waveAt(uv,localTime);
    if(reveal>0.0)gradient=mix(gradient,plasmaGradient(uv*2.0,time),reveal);
    if(edge>0.0){
      float sampleDistance=8.0/max(uResolution.y,1.0);
      float e=abs(waveAt(uv+vec2(sampleDistance,0.0),localTime)-gradient)
             +abs(waveAt(uv+vec2(0.0,sampleDistance),localTime)-gradient);
      tone+=smoothstep(0.012,0.09,e)*edge*0.50;
    }
    gradient = clamp(gradient+tone, 0.0, 1.0);


    float baseGradient = gradient;


    if (uHasImage) {
        vec2 baseUV = getCoverUV(uv, uResolution, uImageResolution);

        vec2 imgUV = (baseUV - 0.5) / uImageScale + 0.5;

        if (imgUV.x >= 0.0 && imgUV.x <= 1.0 && imgUV.y >= 0.0 && imgUV.y <= 1.0) {
           vec4 imgColor = texture2D(uImage, imgUV);

           float imgAlpha = imgColor.a;


           float luminance = dot(imgColor.rgb, vec3(0.299, 0.587, 0.114));
           float structure = smoothstep(0.0, 1.0, luminance); 
           float imageAffectedGradient = gradient * structure * 1.5;
           float blendedGradient = mix(gradient, imageAffectedGradient, uImageOpacity);


           gradient = mix(baseGradient, blendedGradient, imgAlpha);
        }
    }


    vec2 ditherPos = uv * uResolution / max(1.0,uDitherSize*pixelScale);
    float threshold = 0.0;
    if (uDitherStyle == 0) threshold = bayer8x8(ditherPos);
    else if (uDitherStyle == 1) threshold = blueNoise(ditherPos);
    else if (uDitherStyle == 2) threshold = halftone(ditherPos, gradient);
    else if (uDitherStyle == 3) threshold = linePattern(ditherPos, 0.785);
    else if (uDitherStyle == 4) threshold = hash(floor(ditherPos));
    else if (uDitherStyle == 5) threshold = bayer4x4(ditherPos);
    else if (uDitherStyle == 6) threshold = ign(ditherPos);
    else if (uDitherStyle == 7) threshold = rings(ditherPos);

    threshold=clamp(threshold+thresholdShift,0.0,1.0);

    float scaledGradient = gradient * float(uColorCount - 1);
    int colorIndex = int(floor(scaledGradient));
    float localGradient = fract(scaledGradient);

    int nextIndex = colorIndex + 1;
    if (nextIndex >= uColorCount) nextIndex = uColorCount - 1;

    vec3 color1 = uColors[0];
    vec3 color2 = uColors[0];

    for (int i = 0; i < 8; i++) {
      if (i == colorIndex) color1 = uColors[i];
      if (i == nextIndex) color2 = uColors[i];
    }

    vec3 finalColor;
    if (uDitherStyle == 2) {
      finalColor = mix(color1, color2, threshold);
    } else {
      finalColor = localGradient > threshold ? color2 : color1;
    }


    if(uEffect==16)finalColor=mix(finalColor,uColors[1],power*mask*0.68);
    if(split>0.0){
      float red=waveAt(uv+vec2(0.010*split,0.0),localTime);
      float blue=waveAt(uv-vec2(0.010*split,0.0),localTime);
      finalColor.r=mix(finalColor.r,uColors[1].r,red*split);
      finalColor.b=mix(finalColor.b,uColors[1].b,blue*split);
    }
    if(invert>0.0)finalColor=mix(finalColor,uColors[0]+uColors[1]-finalColor,invert);

    gl_FragColor = vec4(clamp(finalColor,0.0,1.0), uDitherOpacity);
  }
`;
    const hexToRgb = (hex) => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [1, 2, 3].map((i) => parseInt(m[i], 16) / 255) : [0, 0, 0];
    };
    const GRADIENTS = ['Wavy', 'Radial', 'Diagonal', 'Noise', 'Plasma', 'Spiral', 'Square', 'Zigzag', 'Swirl', 'Aurora'];
    const DITHERS = ['Bayer 8x8', 'Blue noise', 'Halftone', 'Lines', 'Random noise', 'Bayer 4x4', 'IGN noise', 'Rings'];
    const FX_CATEGORIES = [
        { name: 'Movement', effects: [[1, 'Parallax'], [2, 'Magnetic Field'], [3, 'Elastic Waves'], [4, 'Wind / Directional Flow'], [5, 'Gravity Orbit'], [6, 'Vortex / Swirl'], [7, 'Mouse Turbulence']] },
        { name: 'Distortion', effects: [[8, 'Ripple / Water'], [9, 'Fisheye Lens'], [10, 'Heat Haze'], [11, 'Kaleidoscope Lens'], [12, 'Interference / Moiré'], [13, 'Pixel Sorting'], [14, 'Pixel Crystallization']] },
        { name: 'Light & Colour', effects: [[15, 'Cursor Spotlight'], [16, 'Colour Shift'], [17, 'Chromatic Aberration'], [18, 'Dither Inversion'], [19, 'Edge Detection'], [20, 'Reveal Lens'], [21, 'CRT Scanline Sweep']] },
        { name: 'Particles & Trails', effects: [[22, 'Pixel Scatter'], [23, 'Mouse Trail / Afterglow'], [24, 'Pixel Dissolve'], [25, 'Echo / Ghosting'], [26, 'Wave Painter'], [27, 'Click Shockwave'], [28, 'Glitch Field']] },
        { name: 'Time & Pattern', effects: [[29, 'Time Freeze'], [30, 'Time Acceleration'], [31, 'Dither Magnifier'], [32, 'Dither Threshold Shift'], [33, 'Mouse Pulse']] }
    ];
    const CLICK_FX = ['Off', 'Shockwave', 'Ripple Pulse', 'Pixel Flash'];
    function addCustomizeControls() {
        const dialog = document.getElementById('spot64-customize-dialog');
        const background = dialog?.querySelector('.sc-body > .sc-section');
        if (!background || dialog.querySelector('#spot64-dither-customize'))
            return false;
        const sec = document.createElement('section');
        sec.id = 'spot64-dither-customize';
        sec.className = 'sc-section';
        const header = document.createElement('h3');
        header.textContent = 'DITHER BACKGROUND';
        sec.append(header);
        const ids = {};
        const field = (name, input) => {
            const row = document.createElement('div');
            row.className = 'sc-field';
            const label = document.createElement('label');
            label.textContent = name;
            label.htmlFor = input.id;
            row.append(label, input);
            sec.append(row);
            return input;
        };
        const makeInput = (type, name) => {
            const el = document.createElement(type === 'select' ? 'select' : 'input');
            if (type !== 'select')
                el.type = type;
            el.id = 'spot64-dither-' + name;
            return el;
        };
        const change = (key, value) => {
            const next = { ...CONFIG, [key]: value };
            CONFIG = normalized(next);
            saveSettings();
        };
        const enabled = makeInput('checkbox', 'enabled');
        enabled.checked = CONFIG.enabled;
        enabled.addEventListener('change', () => change('enabled', enabled.checked));
        ids.enabled = field('Animated background', enabled);
        const themeToggle = makeInput('checkbox', 'match-theme');
        themeToggle.checked = CONFIG.matchTheme;
        themeToggle.addEventListener('change', () => change('matchTheme', themeToggle.checked));
        ids.matchTheme = field('Match active theme colours', themeToggle);
        const pick = (name, key, options) => {
            const select = makeInput('select', name);
            options.forEach((title, i) => { const op = document.createElement('option'); op.value = String(i); op.textContent = title; select.append(op); });
            select.value = String(CONFIG[key]);
            select.addEventListener('change', () => change(key, Number(select.value)));
            ids[name] = field(name === 'gradient' ? 'Gradient pattern' : 'Dither pattern', select);
        };
        pick('gradient', 'gradientStyle', GRADIENTS);
        pick('dither', 'ditherStyle', DITHERS);
        const range = (name, label, min, max, step, key, unit, convert) => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;align-items:center;gap:8px;min-width:0';
            const slider = makeInput('range', name);
            slider.min = String(min);
            slider.max = String(max);
            slider.step = String(step);
            slider.style.cssText = 'flex:1;min-width:0;accent-color:var(--spot64-ui-heading,#aeb8c7)';
            slider.value = String(convert ? CONFIG[key] * 100 : CONFIG[key]);
            const output = document.createElement('output');
            output.htmlFor = slider.id;
            output.style.cssText = 'min-width:45px;text-align:right;font:inherit;white-space:nowrap';
            const show = () => { output.textContent = slider.value + unit; };
            show();
            slider.addEventListener('input', () => { show(); change(key, convert ? Number(slider.value) / 100 : Number(slider.value)); });
            wrap.append(slider, output);
            const row = document.createElement('div');
            row.className = 'sc-field';
            const l = document.createElement('label');
            l.htmlFor = slider.id;
            l.textContent = label;
            row.append(l, wrap);
            sec.append(row);
            ids[name] = { slider, output, unit, key, convert };
        };
        range('size', 'Dither pixel size', 1, 24, 1, 'ditherSize', 'px');
        range('speed', 'Animation speed', 0, 1, 0.01, 'speed', '');
        range('opacity', 'Dither opacity', 0, 100, 1, 'ditherOpacity', '%', true);
        const parallax = makeInput('checkbox', 'parallax');
        parallax.checked = CONFIG.parallaxEnabled;
        parallax.addEventListener('change', () => change('parallaxEnabled', parallax.checked));
        ids.parallax = field('Mouse parallax', parallax);
        range('parallax-strength', 'Mouse response', 0, 100, 1, 'parallaxStrength', '%', true);
        const sectionTitle = document.createElement('h4');
        sectionTitle.textContent = 'MOUSE EFFECTS';
        sectionTitle.style.cssText = 'margin:18px 0 7px;font-size:12px;letter-spacing:.08em;color:var(--spot64-ui-heading,#c2ccdf)';
        sec.append(sectionTitle);
        const category = makeInput('select', 'effect-category');
        FX_CATEGORIES.forEach(group => {
            const option = document.createElement('option');
            option.value = group.name;
            option.textContent = group.name;
            category.append(option);
        });
        const effect = makeInput('select', 'effect');
        function showCategory(id) {
            const group = FX_CATEGORIES.find(g => g.effects.some(item => item[0] === id)) || FX_CATEGORIES[0];
            category.value = group.name;
            effect.replaceChildren();
            const off = document.createElement('option');
            off.value = '0';
            off.textContent = 'Off';
            effect.append(off);
            for (const [value, title] of group.effects) {
                const option = document.createElement('option');
                option.value = String(value);
                option.textContent = title;
                effect.append(option);
            }
            effect.value = String(id);
        }
        showCategory(CONFIG.effect);
        category.addEventListener('change', () => {
            const group = FX_CATEGORIES.find(g => g.name === category.value);
            effect.replaceChildren();
            const off = document.createElement('option');
            off.value = '0';
            off.textContent = 'Off';
            effect.append(off);
            for (const [value, title] of group.effects) {
                const o = document.createElement('option');
                o.value = String(value);
                o.textContent = title;
                effect.append(o);
            }
            effect.value = '0';
            change('effect', 0);
        });
        effect.addEventListener('change', () => change('effect', Number(effect.value)));
        ids.effectCategory = field('Category', category);
        ids.effect = field('Mouse effect', effect);
        range('effect-strength', 'Effect strength', 0, 100, 1, 'effectStrength', '%', true);
        range('effect-radius', 'Effect radius', 0, 100, 1, 'effectRadius', '%', true);
        range('effect-smoothing', 'Pointer smoothing', 0, 100, 1, 'effectSmoothing', '%', true);
        const click = makeInput('select', 'click-effect');
        CLICK_FX.forEach((name, i) => { const option = document.createElement('option'); option.value = String(i); option.textContent = name; click.append(option); });
        click.value = String(CONFIG.clickEffect);
        click.addEventListener('change', () => change('clickEffect', Number(click.value)));
        ids.clickEffect = field('Click effect', click);
        range('click-strength', 'Click strength', 0, 100, 1, 'clickStrength', '%', true);
        const fxHint = document.createElement('p');
        fxHint.className = 'sc-hint';
        fxHint.textContent = 'Choose one main effect; optional Parallax and click effects can run with it. Changes appear live. For less GPU work, select Off. Mouse FX work over the wallpaper without intercepting clicks.';
        sec.append(fxHint);
        const color = (name, index, label) => {
            const picker = makeInput('color', name);
            picker.value = CONFIG.colors[index];
            picker.addEventListener('input', () => {
                if (CONFIG.matchTheme)
                    return;
                const colors = CONFIG.colors.slice();
                colors[index] = picker.value;
                change('colors', colors);
            });
            ids[name] = field(label, picker);
        };
        color('dark', 0, 'Dark colour');
        color('light', 1, 'Light colour');
        const hint = document.createElement('p');
        hint.className = 'sc-hint';
        hint.textContent = 'When matching is on, the Dither uses the active CSS background and a subtle accent tint. Switch it off to use your saved manual colours. Other Dither settings are unchanged.';
        sec.append(hint);
        const reset = document.createElement('button');
        reset.type = 'button';
        reset.textContent = 'RESET DITHER SETTINGS';
        reset.addEventListener('click', () => {
            CONFIG = normalized(DEFAULTS);
            saveSettings();
            ids.enabled.checked = CONFIG.enabled;
            ids.parallax.checked = CONFIG.parallaxEnabled;
            showCategory(CONFIG.effect);
            click.value = String(CONFIG.clickEffect);
            ids.gradient.value = String(CONFIG.gradientStyle);
            ids.dither.value = String(CONFIG.ditherStyle);
            syncColorPickers();
            for (const name of ['size', 'speed', 'opacity', 'parallax-strength', 'effect-strength', 'effect-radius', 'effect-smoothing', 'click-strength']) {
                const r = ids[name];
                r.slider.value = String(r.convert ? CONFIG[r.key] * 100 : CONFIG[r.key]);
                r.output.textContent = r.slider.value + r.unit;
            }
        });
        sec.append(reset);
        background.after(sec);
        refreshThemeColors();
        syncColorPickers();
        return true;
    }
    function initCustomizeControls() {
        let previousDialog = null;
        const check = () => {
            const dialog = document.getElementById('spot64-customize-dialog');
            if (dialog && dialog !== previousDialog) {
                previousDialog = dialog;
                addCustomizeControls();
            }
        };
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    const style = document.createElement('style');
    style.id = 'spot64-dither-style';
    style.textContent = `
    #tm-root > #spot64-dither-layer {
      position:absolute!important; inset:0!important; z-index:0!important;
      display:block!important; overflow:hidden!important; border:0!important;
      padding:0!important; margin:0!important; border-radius:0!important;
      pointer-events:none!important; opacity:1!important;
      background:transparent!important; contain:paint;
    }
    #tm-root > #spot64-dither-layer[data-disabled="true"] { display:none!important; }
    #tm-root#tm-root > .tm-main { background-color:transparent!important; }
    #tm-root > #spot64-dither-layer > canvas {
      position:absolute!important; inset:0!important; display:block!important;
      width:100%!important; height:100%!important; margin:0!important;
      pointer-events:none!important; background:transparent!important;
    }
  `;
    document.head.appendChild(style);
    let retryTimer = 0;
    function start(root) {
        if (instance || root.querySelector('#spot64-dither-layer'))
            return;
        const layer = document.createElement('div');
        layer.id = 'spot64-dither-layer';
        layer.dataset.disabled = String(!CONFIG.enabled);
        layer.setAttribute('aria-hidden', 'true');
        const canvas = document.createElement('canvas');
        layer.appendChild(canvas);
        root.appendChild(layer);
        let gl, program, vs, fs, buffer, texture, observer;
        let raf = 0, prev = 0, time = 0, dead = false, needsResize = true, lastPaletteCheck = 0;
        const pointerTarget = [0, 0], pointerCurrent = [0, 0];
        const cursorTarget = [0.5, 0.5], cursorCurrent = [0.5, 0.5];
        const velocity = [0, 0], lastCursor = [0.5, 0.5];
        const trails = [], clicks = [];
        const trailUniform = new Float32Array(18), clickUniform = new Float32Array(12), colorUniform = new Float32Array(24);
        let mouseInside = false, lastTrailAt = -10, freezeAt = time;
        const inBounds = (event) => {
            const rect = root.getBoundingClientRect();
            if (!rect.width || !rect.height ||
                event.clientX < rect.left || event.clientX > rect.right ||
                event.clientY < rect.top || event.clientY > rect.bottom)
                return null;
            return [Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
                Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))];
        };
        const onPointerMove = (event) => {
            if (event.pointerType === 'touch')
                return;
            const p = inBounds(event);
            if (!p) {
                mouseInside = false;
                pointerTarget[0] = 0;
                pointerTarget[1] = 0;
                return;
            }
            if (!mouseInside)
                freezeAt = time;
            mouseInside = true;
            cursorTarget[0] = p[0];
            cursorTarget[1] = p[1];
            pointerTarget[0] = p[0] * 2 - 1;
            pointerTarget[1] = p[1] * 2 - 1;
            if ((CONFIG.effect === 23 || CONFIG.effect === 25 || CONFIG.effect === 26) && time - lastTrailAt > 0.055) {
                trails.unshift({ x: p[0], y: p[1], t: time });
                if (trails.length > 6)
                    trails.length = 6;
                lastTrailAt = time;
            }
            wake();
        };
        const onPointerDown = (event) => {
            if (event.pointerType === 'touch' || !(CONFIG.clickEffect || CONFIG.effect === 27))
                return;
            const p = inBounds(event);
            if (!p)
                return;
            clicks.unshift({ x: p[0], y: p[1], t: time });
            if (clicks.length > 4)
                clicks.length = 4;
            wake();
        };
        const onPointerLeave = () => { pointerTarget[0] = 0; pointerTarget[1] = 0; mouseInside = false; wake(); };
        const uniforms = {};
        const compile = (type, src) => {
            const shader = gl.createShader(type);
            if (!shader)
                throw new Error('Shader allocation failed');
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const log = gl.getShaderInfoLog(shader);
                gl.deleteShader(shader);
                throw new Error('Shader compilation failed: ' + log);
            }
            return shader;
        };
        const onVisibility = () => { prev = 0; if (!document.hidden && !dead)
            wake(); };
        function cleanup() {
            if (dead)
                return;
            dead = true;
            cancelAnimationFrame(raf);
            observer?.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pointermove', onPointerMove, true);
            window.removeEventListener('blur', onPointerLeave);
            document.removeEventListener('mouseleave', onPointerLeave);
            window.removeEventListener('pointerdown', onPointerDown, true);
            try {
                if (gl) {
                    if (texture)
                        gl.deleteTexture(texture);
                    if (buffer)
                        gl.deleteBuffer(buffer);
                    if (program)
                        gl.deleteProgram(program);
                    if (vs)
                        gl.deleteShader(vs);
                    if (fs)
                        gl.deleteShader(fs);
                }
            }
            catch (_) { }
            layer.remove();
            instance = null;
        }
        function wake() { if (!raf && !dead && CONFIG.enabled)
            raf = requestAnimationFrame(frame); }
        function resize() {
            const w = Math.max(1, Math.round(layer.clientWidth));
            const h = Math.max(1, Math.round(layer.clientHeight));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
            gl.viewport(0, 0, w, h);
            needsResize = false;
        }
        function render() {
            if (needsResize)
                resize();
            gl.useProgram(program);
            gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
            const active = CONFIG.parallaxEnabled || CONFIG.effect === 1;
            const ease = 0.12;
            for (let i = 0; i < 2; i++)
                pointerCurrent[i] += ((active ? pointerTarget[i] : 0) - pointerCurrent[i]) * ease;
            gl.uniform2f(uniforms.uPointer, pointerCurrent[0], pointerCurrent[1]);
            gl.uniform1f(uniforms.uParallaxStrength, CONFIG.parallaxEnabled ? CONFIG.parallaxStrength : 0);
            const smooth = 0.36 - CONFIG.effectSmoothing * 0.325;
            for (let i = 0; i < 2; i++) {
                cursorCurrent[i] += (cursorTarget[i] - cursorCurrent[i]) * smooth;
                velocity[i] = velocity[i] * 0.72 + (cursorCurrent[i] - lastCursor[i]) * 0.28;
                lastCursor[i] = cursorCurrent[i];
            }
            gl.uniform1i(uniforms.uEffect, CONFIG.effect);
            gl.uniform1f(uniforms.uEffectStrength, CONFIG.effectStrength);
            gl.uniform1f(uniforms.uEffectRadius, CONFIG.effectRadius);
            gl.uniform2f(uniforms.uCursor, cursorCurrent[0], cursorCurrent[1]);
            gl.uniform2f(uniforms.uVelocity, velocity[0] * 70, velocity[1] * 70);
            gl.uniform1f(uniforms.uPointerActive, mouseInside ? 1 : 0);
            gl.uniform1f(uniforms.uFreezeTime, freezeAt);
            gl.uniform1i(uniforms.uClickEffect, CONFIG.clickEffect);
            gl.uniform1f(uniforms.uClickStrength, CONFIG.clickStrength);
            for (let i = 0; i < 6; i++) {
                const item = trails[i], age = item ? time - item.t : -10, offset = i * 3;
                trailUniform[offset] = item?.x ?? 0;
                trailUniform[offset + 1] = item?.y ?? 0;
                trailUniform[offset + 2] = age;
            }
            gl.uniform3fv(uniforms['uTrail[0]'], trailUniform);
            for (let i = 0; i < 4; i++) {
                const item = clicks[i], age = item ? time - item.t : -10, offset = i * 3;
                clickUniform[offset] = item?.x ?? 0;
                clickUniform[offset + 1] = item?.y ?? 0;
                clickUniform[offset + 2] = age;
            }
            gl.uniform3fv(uniforms['uClicks[0]'], clickUniform);
            gl.uniform1f(uniforms.uTime, time);
            gl.uniform1f(uniforms.uSpeed, CONFIG.speed);
            gl.uniform1i(uniforms.uGradientStyle, CONFIG.gradientStyle);
            gl.uniform1i(uniforms.uDitherStyle, CONFIG.ditherStyle);
            gl.uniform1f(uniforms.uDitherSize, CONFIG.ditherSize);
            gl.uniform1f(uniforms.uDitherOpacity, CONFIG.ditherOpacity);
            gl.uniform1i(uniforms.uColorCount, CONFIG.colors.length);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniforms.uImage, 0);
            gl.uniform1i(uniforms.uHasImage, 0);
            gl.uniform2f(uniforms.uImageResolution, 1, 1);
            gl.uniform1f(uniforms.uImageOpacity, CONFIG.imageOpacity);
            gl.uniform1f(uniforms.uImageScale, CONFIG.imageScale);
            const palette = activeColors();
            for (let i = 0; i < 8; i++)
                colorUniform.set(hexToRgb(palette[i] || palette.at(-1)), i * 3);
            gl.uniform3fv(uniforms['uColors[0]'], colorUniform);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        function frame(now) {
            raf = 0;
            if (dead || !layer.isConnected || !root.isConnected) {
                cleanup();
                return;
            }
            if (!CONFIG.enabled) {
                prev = 0;
                return;
            }
            if (document.hidden || root.hidden || getComputedStyle(root).display === 'none') {
                prev = 0;
                if (!document.hidden)
                    setTimeout(() => { if (!dead)
                        wake(); }, 500);
                return;
            }
            if (prev && now - prev < 33 && !needsResize) {
                wake();
                return;
            }
            if (CONFIG.matchTheme && (!lastPaletteCheck || now - lastPaletteCheck >= 750)) {
                lastPaletteCheck = now;
                refreshThemeColors(root);
            }
            const dt = prev ? Math.min((now - prev) / 1000, .1) : 1 / 30;
            prev = now;
            time += dt;
            try {
                render();
            }
            catch (e) {
                console.warn('[Spot64 Dither] render failed:', e);
                cleanup();
                return;
            }
            wake();
        }
        try {
            gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
            if (!gl)
                throw new Error('WebGL unavailable');
            vs = compile(gl.VERTEX_SHADER, vertexShader);
            try {
                fs = compile(gl.FRAGMENT_SHADER, fragmentShader);
            }
            catch (effectShaderError) {
                console.warn('[Spot64 Dither] Mouse FX shader unavailable; using original Dither.', effectShaderError);
                fs = compile(gl.FRAGMENT_SHADER, legacyFragmentShader);
            }
            program = gl.createProgram();
            if (!program)
                throw new Error('Program allocation failed');
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS))
                throw new Error('Shader link failed: ' + gl.getProgramInfoLog(program));
            gl.useProgram(program);
            for (const name of ['uResolution', 'uPointer', 'uParallaxStrength', 'uEffect', 'uEffectStrength', 'uEffectRadius', 'uClickEffect', 'uClickStrength', 'uCursor', 'uVelocity', 'uPointerActive', 'uFreezeTime', 'uTrail[0]', 'uClicks[0]', 'uTime', 'uSpeed', 'uGradientStyle', 'uDitherStyle', 'uDitherSize', 'uDitherOpacity', 'uColorCount', 'uImage', 'uHasImage', 'uImageResolution', 'uImageOpacity', 'uImageScale', 'uColors[0]'])
                uniforms[name] = gl.getUniformLocation(program, name);
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const location = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
            observer = new ResizeObserver(() => { needsResize = true; wake(); });
            observer.observe(layer);
            document.addEventListener('visibilitychange', onVisibility);
            window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
            window.addEventListener('blur', onPointerLeave);
            document.addEventListener('mouseleave', onPointerLeave);
            window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
            instance = { cleanup, wake, layer };
            refreshThemeColors(root);
            wake();
        }
        catch (e) {
            console.warn('[Spot64 Dither] disabled:', e);
            cleanup();
        }
    }
    function boot() {
        clearTimeout(retryTimer);
        const root = document.getElementById('tm-root');
        if (root && root.isConnected) {
            start(root);
            return;
        }
        retryTimer = setTimeout(boot, 500);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', () => { initCustomizeControls(); boot(); }, { once: true });
    else {
        initCustomizeControls();
        boot();
    }
})();
