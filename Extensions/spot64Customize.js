(() => {
    'use strict';
    const KEY = 'spot64.customize.v1';
    const defaults = {
        borderSize: '', borderStyle: '', borderColor: '', borderColor2: '', borderGradient: false,
        fontSize: '', titleFontSize: '', trackFontSize: '', playerFontSize: '', seekFontSize: '', fontFamily: '', headerFontFamily: '', mainBg: '', panelBg: '', text: '', muted: '', highlight: '',
        button: '', progress: '', progressEmpty: '', visualizer: '', heading: '',
        seekStyle: 'native', visualizerStyle: 'blocks',
        libraryTitle: '', playlistsTitle: '', musicTitle: '',
        wallpaperId: '', wallpaperName: '', wallpaperOpacity: 10,
        panelRadius: '', panelOpacity: '', panelGap: '', panelShadow: '',
        playerBg: '', buttonBg: '', letterSpacing: '', advancedCSS: ''
    };
    let settings = { ...defaults };
    try {
        settings = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    }
    catch (_) { }
    const STYLES = ['solid', 'double', 'dashed', 'dotted', 'square'];
    const esc = value => String(value).replace(/[\\"<>]/g, '');
    const cssValue = value => /^#[\da-fA-F]{6}$/.test(value || '') ? value : '';
    const $ = (s, root = document) => root.querySelector(s);
    const make = (tag, className, label) => {
        const n = document.createElement(tag);
        if (className)
            n.className = className;
        if (label != null)
            n.textContent = label;
        return n;
    };
    const CSS_KEY = 'spot64.custom.css.v1';
    const CSS_MAX_FILE = 100 * 1024;
    const CSS_MAX_TOTAL = 350 * 1024;
    const CSS_MAX_FILES = 8;
    const presetPalettes = {
        'spot64': { name: 'Spot64', bg: '#101112', panel: '#18191b', player: '#121314', line: '#666969', text: '#e8e6e3', muted: '#969e9b', accent: '#95b9b2', selection: '#2b3131', corner: '0', glow: false },
        'amber': { name: 'Catppuccin', bg: '#292c3c', panel: '#303446', player: '#292c3c', line: '#626880', text: '#c6d0f5', muted: '#a5adce', accent: '#ca9ee6', selection: '#414559', corner: '6px', glow: false },
        'spotify': { name: 'Spotify', bg: '#121212', panel: '#181818', player: '#121212', line: '#181818', text: '#ffffff', muted: '#b3b3b3', accent: '#1ed760', selection: '#282828', corner: '9px', glow: false },
        'phosphor': { name: 'Access Granted', bg: '#010603', panel: '#041009', player: '#020804', line: '#67cb72', text: '#bcf7ae', muted: '#7bbd82', accent: '#7df17e', selection: '#12311a', corner: '0', glow: true },
        'violet': { name: 'Discord', bg: '#232428', panel: '#2b2d31', player: '#232428', line: '#32343a', text: '#f2f3f5', muted: '#949ba4', accent: '#949cf7', selection: '#404249', corner: '8px', glow: false },
        'mono': { name: 'Twitch', bg: '#0e0e10', panel: '#1f1f23', player: '#18181b', line: '#26262c', text: '#efeff1', muted: '#adadb8', accent: '#bf94ff', selection: '#323239', corner: '5px', glow: false }
    };
    const cssDefaults = () => ({ preset: '', files: [] });
    let cssState = cssDefaults();
    try {
        const saved = JSON.parse(localStorage.getItem(CSS_KEY) || '{}');
        if (saved && typeof saved === 'object') {
            cssState.preset = Object.hasOwn(presetPalettes, saved.preset) ? saved.preset : '';
            if (Array.isArray(saved.files))
                cssState.files = saved.files.slice(0, CSS_MAX_FILES)
                    .filter(f => f && typeof f.name === 'string' && typeof f.css === 'string' && f.css.length <= CSS_MAX_FILE && !/@import\b|url\s*\(|expression\s*\(|-moz-binding\b/i.test(f.css))
                    .map(f => ({ name: f.name.slice(0, 120), css: f.css, enabled: f.enabled !== false }));
        }
    }
    catch (error) {
        console.warn('[Spot64 CSS] Could not load saved styles', error);
    }
    const cssPresetStyle = make('style');
    cssPresetStyle.id = 'spot64-preset-css';
    const cssUserStyle = make('style');
    cssUserStyle.id = 'spot64-imported-css';
    const advancedStyle = make('style');
    advancedStyle.id = 'spot64-advanced-overrides';
    function presetCSS(id) {
        const c = presetPalettes[id];
        if (!c)
            return '';
        return `:root{--spot64-ui-panel:${c.panel}!important;--spot64-ui-text:${c.text}!important;--spot64-ui-muted:${c.muted}!important;--spot64-ui-heading:${c.accent}!important;--spot64-ui-border:${c.line}!important;--spot64-ui-highlight:${c.selection}!important;--spot64-ui-button:${c.text}!important;--spot64-ui-field:${c.panel}!important;}` +
            `#tm-root{color:${c.text}!important;--tm-line:${c.line}!important;}` +
            `#tm-root,#tm-root .tm-main{background-color:${c.bg}!important;}` +
            `#tm-root .tm-panel{background-color:${c.panel}!important;color:${c.text}!important;border-color:${c.line}!important;}` +
            `#tm-root .tm-title{color:${c.accent}!important;}` +
            `#tm-root .tm-muted{color:${c.muted}!important;}` +
            `#tm-root .tm-player-row{background-color:${c.player}!important;color:${c.text}!important;border-top-color:${c.line}!important;}` +
            `#tm-root .tm-track:hover,#tm-root .tm-item:hover,#tm-root .tm-active{background-color:${c.selection}!important;}` +
            `#tm-root .tm-seek{accent-color:${c.accent}!important;}` +
            `#tm-root .sc-seek-characters{color:${c.accent}!important;}` +
            `#tm-root.st-customize-mode > .tm-main > #spot64-customize-dialog:not([hidden]){background-color:${c.panel}!important;border-color:${c.line}!important;color:${c.text}!important;}` +
            `:root{--spot64-ui-radius:${c.corner}!important;}` +
            `#tm-root .tm-panel,#spot64-customize-dialog,#spot64-themes-screen{border-radius:${c.corner}!important;}` +
            (c.glow ? `#tm-root .tm-title{ text-shadow:0 0 5px ${c.accent}66!important;}` : '');
    }
    function saveCSS() {
        try {
            localStorage.setItem(CSS_KEY, JSON.stringify(cssState));
            return true;
        }
        catch (e) {
            console.warn('[Spot64 CSS] Storage is full or unavailable', e);
            return false;
        }
    }
    function applyCSS() {
        cssPresetStyle.textContent = presetCSS(cssState.preset);
        cssUserStyle.textContent = cssState.files.filter(f => f.enabled).map(f => f.css).join('\n\n');
    }
    function saveCSSFile(name, css) {
        const blob = new Blob([css], { type: 'text/css;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = make('a');
        a.href = url;
        a.download = name.endsWith('.css') ? name : `${name}.css`;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1200);
    }
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'Digit0') {
            e.preventDefault();
            e.stopImmediatePropagation();
            cssState = cssDefaults();
            cssPresetStyle.textContent = '';
            cssUserStyle.textContent = '';
            settings.advancedCSS = '';
            save();
            apply();
            saveCSS();
            window.Spicetify?.showNotification?.('Spot64 custom CSS disabled');
        }
    }, true);
    const stylesheet = make('style');
    stylesheet.id = 'spot64-customize-styles';
    const baseStyle = make('style');
    baseStyle.textContent = `
    #spot64-customize-open {font:inherit; color:inherit; background:transparent; border:1px solid currentColor; padding:3px 9px; cursor:pointer; margin-left:auto; font-size:12px}
    #spot64-customize-open:hover {background:#ffffff18}
    #spot64-customize-dialog {position:fixed; z-index:2147483646; right:18px; top:72px; width:min(435px,calc(100vw - 36px)); max-height:calc(100vh - 96px); overflow:auto; background:#101216; color:#f2f2f2; border:1px solid #777; box-shadow:0 12px 40px #000d; padding:15px; font:12px Consolas,monospace; box-sizing:border-box; }
    #spot64-customize-dialog[hidden] {display:none!important}
    #spot64-customize-dialog * {box-sizing:border-box}
    #spot64-customize-dialog .sc-head {display:flex; justify-content:space-between; align-items:center; gap:10px; font-weight:700; margin-bottom:12px}
    #spot64-customize-dialog button {font:inherit; cursor:pointer; color:inherit; background:#22262d; border:1px solid #626976; padding:5px 9px}
    #spot64-customize-dialog button:hover {background:#353b45}
    #spot64-customize-dialog .sc-section {padding:10px 0; border-top:1px solid #383b41}
    #spot64-customize-dialog h3 {font-size:12px; font-weight:700; margin:0 0 9px;color:#c9ced9}
    #spot64-customize-dialog .sc-field {display:grid; grid-template-columns: 160px minmax(0,1fr); align-items:center; gap:8px; margin:7px 0}
    #spot64-customize-dialog label {color:#d5d8dd}
    #spot64-customize-dialog input:not([type=checkbox]), #spot64-customize-dialog select {min-width:0; width:100%; padding:5px; font:inherit; background:#1c2026; color:#fff; border:1px solid #535761;}
    #spot64-customize-dialog input[type=color] {height:29px; padding:2px}
    #spot64-customize-dialog input[type=checkbox] {accent-color:#b5c5ef; justify-self:start}
    #spot64-customize-dialog .sc-hint {font-size:11px; color:#a1a7b1; line-height:1.5; margin:7px 0}
    #spot64-customize-dialog .sc-buttons {display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
    #spot64-customize-dialog .sc-preview {overflow:hidden; padding:8px; background:#181c23; border:1px solid #4d535c; white-space:nowrap; margin:7px 0;}
    #spot64-customize-dialog .sc-message {font-size:11px; color:#bdc5d4; min-height:15px}


    #tm-context-menu,
    #spot64-customize-dialog {
      color:var(--spot64-ui-text,#eee)!important;
      background-color:var(--spot64-ui-panel,#1a1c22)!important;
      font-family:var(--spot64-ui-font,Consolas,monospace)!important;
      font-size:var(--spot64-ui-size,12px)!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
    }
    :root[data-spot64-menu-gradient="true"] #tm-context-menu,
    :root[data-spot64-menu-gradient="true"] #spot64-customize-dialog {
      border-color:transparent!important;
      border-style:solid!important;
      background-image:linear-gradient(var(--spot64-ui-panel,#1a1c22),var(--spot64-ui-panel,#1a1c22)),var(--spot64-ui-gradient)!important;
      background-origin:padding-box,border-box!important;
      background-clip:padding-box,border-box!important;
    }
    #tm-context-menu {min-width:230px;padding:7px 6px!important;overflow:visible!important;}
    #tm-context-menu button {font:inherit!important;color:var(--spot64-ui-button,var(--spot64-ui-text,#eee))!important;}
    #tm-context-menu button:hover:not(:disabled){background:var(--spot64-ui-highlight,#30343b)!important;}
    #tm-context-menu .tm-menu-divider{border-top:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;}

    #spot64-customize-dialog {padding:0!important;overflow:visible!important;}
    #spot64-customize-dialog .sc-body {box-sizing:border-box;padding:20px 15px 15px;max-height:calc(100vh - 96px);overflow-y:auto;}
    #spot64-customize-dialog .sc-head {
      position:absolute!important;top:0!important;left:12px;right:12px;z-index:4;
      transform:translateY(-50%);display:flex;align-items:center;
      justify-content:space-between;padding:0!important;margin:0!important;
      background:transparent!important;border:0!important;
      pointer-events:none;
    }
    #spot64-customize-dialog .sc-head > .sc-frame-title {
      position:relative;display:inline-block;
      color:var(--spot64-ui-heading,#eee)!important;
      font:700 var(--spot64-ui-heading-size,12px)/1.3 var(--spot64-ui-font,Consolas,monospace)!important;
    }


    #spot64-customize-dialog .sc-frame-title {
      margin:0 0 0 2px;padding:0 6px!important;
      background:var(--spot64-ui-panel,#1a1c22)!important;
    }
    #spot64-customize-dialog .sc-head > button {margin:0;background:var(--spot64-ui-panel,#1a1c22)!important;pointer-events:auto;}
    #spot64-customize-dialog button {font:inherit!important;color:var(--spot64-ui-button,var(--spot64-ui-text,#eee))!important;background:var(--spot64-ui-field,#23272e)!important;border:var(--spot64-ui-border-width,1px) solid var(--spot64-ui-border,#696c74)!important;border-radius:3px;}
    #spot64-customize-dialog button:hover {background:var(--spot64-ui-highlight,#30343b)!important;}
    #spot64-customize-dialog .sc-section {border-top:1px solid var(--spot64-ui-border,#696c74)!important;}
    #spot64-customize-dialog h3 {color:var(--spot64-ui-heading,#eee)!important;font:700 1em var(--spot64-ui-font,Consolas,monospace)!important;}
    #spot64-customize-dialog label {color:var(--spot64-ui-text,#eee)!important;}
    #spot64-customize-dialog input:not([type=checkbox]),#spot64-customize-dialog select {
      background:var(--spot64-ui-field,#23272e)!important;
      color:var(--spot64-ui-text,#eee)!important;
      border:1px solid var(--spot64-ui-border,#696c74)!important;
      font:inherit!important;
    }
    #spot64-customize-dialog input[type=color] {padding:2px!important;min-height:28px;}
    #spot64-customize-dialog input[type=checkbox] {accent-color:var(--spot64-ui-heading,#eee)!important;}
    #spot64-customize-dialog .sc-hint,#spot64-customize-dialog .sc-message {color:var(--spot64-ui-muted,#aab0bb)!important;}
    #spot64-customize-dialog .sc-advanced {margin:13px 0 0;border-top:1px solid var(--spot64-ui-border,#696c74);}
    #spot64-customize-dialog .sc-advanced > summary {
      padding:14px 5px;cursor:pointer;list-style:none;
      font-weight:700;color:var(--spot64-ui-heading,#eee);user-select:none;
    }
    #spot64-customize-dialog .sc-advanced > summary::-webkit-details-marker{display:none;}
    #spot64-customize-dialog .sc-advanced > summary::after{content:'▾';float:right;}
    #spot64-customize-dialog .sc-advanced[open] > summary::after{content:'▴';}
    #spot64-customize-dialog .sc-advanced > .sc-section:first-of-type{border-top:0!important;}
    #spot64-customize-dialog .sc-field{grid-template-columns:minmax(110px,42%) minmax(0,1fr)!important;}
    @media(max-width:440px){#spot64-customize-dialog{right:8px;width:calc(100vw - 16px)!important;}#spot64-customize-dialog .sc-field{grid-template-columns:minmax(96px,40%) minmax(0,1fr)!important;}}


#tm-root#tm-root > .st-quick-row .tm-search-input,
#tm-root#tm-root > .st-quick-row .st-terminal-input {
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  border-radius:0!important;
  box-shadow:none!important;
  outline:0!important;
}
#tm-root#tm-root > .st-quick-row .tm-search-form,
#tm-root#tm-root > .st-quick-row .st-terminal,
#tm-root#tm-root > .st-quick-row .st-terminal-form,
#tm-root#tm-root > .st-quick-row .st-quick-cell {
  background:transparent!important;
  background-image:none!important;
  border:0!important;
  box-shadow:none!important;
}
#tm-root#tm-root > .st-quick-row .tm-search-input:focus-visible,
#tm-root#tm-root > .st-quick-row .st-terminal-input:focus-visible {
  box-shadow: inset 0 -1px 0 var(--spot64-ui-heading,#c5cad3)!important;
}


    #tm-root::before {
      content:'';position:absolute;inset:0;z-index:0;pointer-events:none;
      background-image:var(--spot64-wallpaper-image,none);
      background-position:center;background-repeat:no-repeat;background-size:cover;
      opacity:var(--spot64-wallpaper-opacity,0);
    }
    #tm-root > .tm-main,#tm-root > .tm-footer,#tm-root > .st-quick-row {position:relative;z-index:1;}
    #tm-root .tm-top {z-index:2;}
    #spot64-customize-dialog .sc-wallpaper-row{display:flex;align-items:center;gap:7px;min-width:0;}
    #spot64-customize-dialog .sc-wallpaper-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--spot64-ui-muted,#aaa);}
    #spot64-customize-dialog .sc-wallpaper-slider{width:100%!important;accent-color:var(--spot64-ui-heading,#eee);}
    #spot64-customize-dialog .sc-wallpaper-row button{flex:0 0 auto;padding:4px 8px;}


    #tm-root > .tm-footer {
      box-sizing:border-box!important;
      flex:0 0 auto!important;
      position:relative!important;
      z-index:5!important;
      width:calc(100% + 28px)!important;
      margin:0 -14px -15px!important;
      padding:14px 14px 15px!important;
      border:0!important;
      border-top:1px solid var(--spot64-ui-border,var(--tm-line,#696c74))!important;
      border-radius:0!important;
      background:var(--spot64-ui-panel,var(--tm-panel,#1a1c22))!important;
      background-image:none!important;
      isolation:isolate;
    }
    @media(max-width:680px){#tm-root > .tm-footer {margin-bottom:-12px!important;padding-bottom:12px!important;}}
    :root[data-spot64-square-borders="true"] #spot64-themes-screen,
    :root[data-spot64-square-borders="true"] #spot64-themes-screen .st-gallery-card,
    :root[data-spot64-square-borders="true"] #tm-context-menu {border-radius:0!important;}


    #tm-root.st-focus-mode:not(.st-themes-mode):not(.st-customize-mode):not(.tm-art-mode) > .tm-main > .tm-side,
    #tm-root.st-focus-mode:not(.st-themes-mode):not(.st-customize-mode):not(.tm-art-mode) > .tm-main > .tm-browser {
      display:none!important;
    }
    #tm-root.st-focus-mode:not(.st-themes-mode):not(.st-customize-mode):not(.tm-art-mode) > .tm-main {
      display:block!important;
      min-height:0!important;
    }


    #tm-root > .st-quick-row {z-index:7!important;}
    #tm-root > .st-quick-row > #spot64-focus-toggle {
      position:absolute!important;
      right:3px!important;
      top:calc(100% - 2px)!important;
      z-index:8!important;
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      box-sizing:border-box!important;
      width:20px!important;
      height:19px!important;
      min-width:0!important;
      padding:0!important;
      margin:0!important;
      border:0!important;
      border-radius:0!important;
      box-shadow:none!important;
      background:transparent!important;
      background-image:none!important;
      color:var(--spot64-ui-heading,#dbe0e8)!important;
      font:17px/1 Consolas,monospace!important;
      text-align:center!important;
      cursor:pointer!important;
    }
    #tm-root:is(.st-customize-mode,.st-themes-mode,.tm-art-mode) > .st-quick-row > #spot64-focus-toggle {display:none!important;}
    #tm-root.st-customize-mode > .tm-footer > .tm-art-toggle {display:none!important;}
    #tm-root > .st-quick-row > #spot64-focus-toggle:hover {filter:brightness(1.35);}
    #tm-root > .st-quick-row > #spot64-focus-toggle:focus-visible {outline:1px solid currentColor!important;outline-offset:2px!important;}


    #tm-root.st-focus-mode:not(.st-customize-mode):not(.st-themes-mode) {
      --spot64-focus-frame-fill:color-mix(in srgb,color-mix(in srgb,var(--spot64-ui-panel,#18191b) 88%,black 12%) 88%,transparent);
      --spot64-focus-frame-radius:max(10px,var(--spot64-ui-radius,8px));
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .st-quick-row {
      display:grid!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .st-quick-row > #spot64-focus-toggle {
      display:flex!important;
      visibility:visible!important;
      pointer-events:auto!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-side,
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-browser {
      display:none!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main {
      display:flex!important;
      flex-direction:row!important;
      justify-content:center!important;
      align-items:center!important;
      min-height:0!important;
      background:transparent!important;
      background-color:transparent!important;
      background-image:none!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-artwork {
      position:relative!important;
      z-index:2!important;
      display:flex!important;
      flex:0 1 auto!important;
      flex-direction:column!important;
      justify-content:center!important;
      align-items:center!important;
      box-sizing:border-box!important;
      width:min(900px,calc(100% - 32px))!important;
      min-width:0!important;
      height:fit-content!important;
      min-height:0!important;
      max-height:calc(100% - 32px)!important;
      margin:0 auto!important;
      padding:clamp(10px,2vw,20px)!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      background:var(--spot64-focus-frame-fill)!important;
      background-image:none!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-focus-frame-radius)!important;
      box-shadow:0 10px 32px #0004!important;
    }

    #tm-root.st-focus-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-footer {
      box-sizing:border-box!important;
      width:calc(100% - 16px)!important;
      margin:0 8px 8px!important;
      padding:12px 14px!important;
      background:var(--spot64-focus-frame-fill)!important;
      background-image:none!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-focus-frame-radius)!important;
      box-shadow:0 8px 24px #0003!important;
    }

    :root[data-spot64-menu-gradient="true"] #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-artwork,
    :root[data-spot64-menu-gradient="true"] #tm-root.st-focus-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-footer {
      border-color:transparent!important;
      border-style:solid!important;
      background-color:transparent!important;
      background-image:linear-gradient(var(--spot64-focus-frame-fill),var(--spot64-focus-frame-fill)),var(--spot64-ui-gradient)!important;
      background-origin:padding-box,border-box!important;
      background-clip:padding-box,border-box!important;
    }

    :root[data-spot64-square-borders="true"] #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-artwork,
    :root[data-spot64-square-borders="true"] #tm-root.st-focus-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-footer {
      border-radius:0!important;
    }

    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-artwork > .tm-ansi-background {
      display:none!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-main > .tm-artwork > .tm-original-ascii-host {
      flex:0 0 auto!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      background:transparent!important;
    }
    #tm-root.st-focus-mode.tm-art-mode:not(.st-customize-mode):not(.st-themes-mode) > .tm-footer > .tm-art-toggle {
      display:inline-flex!important;
      visibility:visible!important;
      pointer-events:auto!important;
    }


    #tm-root > .tm-footer .spot64-volume-control {
      display:flex!important; align-items:center!important; gap:7px!important;
      box-sizing:border-box!important; flex:0 1 185px!important;
      width:185px!important; min-width:118px!important; max-width:185px!important;
      margin:0 0 0 auto!important; padding:0!important;
      background:transparent!important; border:0!important;
      color:var(--spot64-ui-text, #e8e6e3)!important;
      font:inherit!important; white-space:nowrap!important;
    }
    #tm-root > .tm-footer .spot64-volume-control .spot64-volume-toggle {
      display:inline-flex!important; align-items:center!important; justify-content:center!important;
      box-sizing:border-box!important; flex:0 0 25px!important;
      width:25px!important; height:27px!important; margin:0!important; padding:2px!important;
      background:transparent!important; border:0!important; border-radius:4px!important;
      box-shadow:none!important; color:var(--spot64-ui-text, #e8e6e3)!important;
      cursor:pointer!important;
    }
    #tm-root > .tm-footer .spot64-volume-toggle:hover {
      color:var(--spot64-ui-heading, #95b9b2)!important;
    }
    #tm-root > .tm-footer .spot64-volume-toggle svg {
      display:block!important; width:19px!important; height:19px!important;
      stroke:currentColor!important; fill:none!important;
      stroke-width:1.7!important; stroke-linecap:round!important; stroke-linejoin:round!important;
      pointer-events:none!important;
    }
    #tm-root > .tm-footer .spot64-volume-toggle .spot64-volume-cross {display:none!important;}
    #tm-root > .tm-footer .spot64-volume-toggle[data-muted="true"] .spot64-volume-waves {display:none!important;}
    #tm-root > .tm-footer .spot64-volume-toggle[data-muted="true"] .spot64-volume-cross {display:block!important;}
    #tm-root > .tm-footer .spot64-volume-slider {
      -webkit-appearance:none!important; appearance:none!important;
      display:block!important; flex:1 1 auto!important; min-width:35px!important; width:100%!important;
      height:5px!important; min-height:5px!important; padding:0!important; margin:0!important;
      cursor:pointer!important; border:0!important; border-radius:99px!important;
      background:linear-gradient(to right,
        var(--spot64-ui-heading,#95b9b2) 0 var(--spot64-volume-fill,50%),
        var(--spot64-ui-border,#555) var(--spot64-volume-fill,50%) 100%)!important;
      box-shadow:none!important;
    }
    #tm-root > .tm-footer .spot64-volume-slider::-webkit-slider-thumb {
      -webkit-appearance:none!important; appearance:none!important;
      box-sizing:border-box!important; width:11px!important; height:11px!important;
      background:var(--spot64-ui-heading,#95b9b2)!important;
      border:1px solid var(--spot64-ui-panel,#18191b)!important;
      border-radius:50%!important; box-shadow:none!important;
    }
    #tm-root > .tm-footer .spot64-volume-slider::-moz-range-thumb {
      box-sizing:border-box!important; width:11px!important; height:11px!important;
      background:var(--spot64-ui-heading,#95b9b2)!important;
      border:1px solid var(--spot64-ui-panel,#18191b)!important;
      border-radius:50%!important;
    }
    #tm-root > .tm-footer .spot64-volume-control :is(button,input):focus-visible {
      outline:2px solid var(--spot64-ui-heading,#95b9b2)!important;
      outline-offset:3px!important;
    }
    #tm-root > .tm-footer .spot64-volume-amount {
      flex:0 0 36px!important; min-width:36px!important; margin:0!important;
      color:var(--spot64-ui-muted,#969e9b)!important;
      font:inherit!important; font-size:11px!important; font-variant-numeric:tabular-nums!important;
      text-align:right!important;
    }
    @media(max-width:650px) {
      #tm-root > .tm-footer .spot64-volume-control {
        flex-basis:120px!important; width:120px!important; min-width:82px!important; gap:4px!important;
      }
      #tm-root > .tm-footer .spot64-volume-amount {display:none!important;}
    }
    @media(max-width:430px) {
      #tm-root > .tm-footer .spot64-volume-control {
        flex-basis:87px!important; width:87px!important; min-width:72px!important;
      }
    }


    #tm-root > .tm-footer.spot64-volume-row-v2 {
      display:grid!important;
      grid-template-columns:minmax(0,1fr) minmax(130px,170px)!important;
      grid-template-rows:minmax(27px,auto) minmax(27px,auto)!important;
      align-items:center!important; column-gap:14px!important; row-gap:7px!important;
    }
    #tm-root > .tm-footer.spot64-volume-row-v2 > .tm-seek {
      grid-column:1!important;grid-row:1!important;width:100%!important;min-width:0!important;
      max-width:100%!important;margin:0!important;justify-self:stretch!important;
    }
    #tm-root > .tm-footer.spot64-volume-row-v2 > .spot64-volume-control {
      grid-column:2!important;grid-row:1!important;justify-self:end!important;
      width:100%!important;max-width:170px!important;min-width:0!important;
      flex:none!important;margin:0!important;
    }
    #tm-root > .tm-footer.spot64-volume-row-v2 > .tm-player-row {
      grid-column:1 / -1!important;grid-row:2!important;
      width:100%!important;min-width:0!important;margin:0!important;
    }
    @media (max-width:650px) {
      #tm-root > .tm-footer.spot64-volume-row-v2 {grid-template-columns:minmax(0,1fr) 120px!important;column-gap:9px!important;}
      #tm-root > .tm-footer.spot64-volume-row-v2 > .spot64-volume-control {max-width:120px!important;}
    }
    @media (max-width:430px) {
      #tm-root > .tm-footer.spot64-volume-row-v2 {grid-template-columns:minmax(0,1fr) 86px!important;column-gap:7px!important;}
      #tm-root > .tm-footer.spot64-volume-row-v2 > .spot64-volume-control {max-width:86px!important;}
    }


    #tm-root #spot64-customize-dialog .sc-nav .sc-nav-group {
      padding:13px 8px 5px;color:var(--spot64-ui-muted,#9da7b4);
      font-size:10px;font-weight:700;letter-spacing:.12em;
    }
    #tm-root #spot64-customize-dialog .sc-nav > .sc-nav-advanced-toggle {
      border-top:1px solid var(--spot64-ui-border,#474b54)!important;
      margin-top:12px!important;padding-top:15px!important;
      font-weight:700!important;color:var(--spot64-ui-heading,#ddd)!important;
    }
    #tm-root #spot64-customize-dialog #spot64-advanced-source {
      background:var(--spot64-ui-field,#171b22)!important;
      color:var(--spot64-ui-text,#eee)!important;
      border:1px solid var(--spot64-ui-border,#474b54)!important;
      border-radius:5px;
    }

    #tm-root.st-customize-mode > .st-quick-row{display:none!important;}
    #tm-root.st-customize-mode > .tm-main{display:flex!important;min-height:0!important;}
    #tm-root.st-customize-mode > .tm-main > .tm-side,
    #tm-root.st-customize-mode > .tm-main > .tm-browser,
    #tm-root.st-customize-mode > .tm-main > .tm-artwork,
    #tm-root.st-customize-mode > .tm-main > #spot64-themes-screen{display:none!important;}
    #tm-root > .tm-main > #spot64-customize-dialog[hidden]{display:none!important;}
    #tm-root.st-customize-mode > .tm-main > #spot64-customize-dialog:not([hidden]){
      position:relative!important;inset:auto!important;right:auto!important;top:auto!important;
      display:flex!important;flex:1 1 auto!important;flex-direction:column!important;
      min-width:0!important;width:100%!important;max-width:none!important;
      min-height:0!important;height:100%!important;max-height:none!important;
      padding:16px 20px!important;margin:0!important;
      z-index:3!important;overflow:hidden!important;
      box-shadow:none!important;transform:none!important;
      background:var(--spot64-ui-panel,#101216)!important;
      background-image:none!important;
      border:1px solid var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
      font:var(--spot64-ui-size,12px) var(--spot64-ui-font,Consolas,monospace)!important;
    }
    #tm-root.st-customize-mode > .tm-main > #spot64-customize-dialog .sc-head {
      position:static!important;transform:none!important;
      display:flex!important;flex:0 0 auto!important;justify-content:space-between!important;
      align-items:center!important;gap:14px!important;
      border:0!important;border-bottom:1px solid var(--spot64-ui-border,#444b55)!important;
      padding:0 0 13px!important;margin:0!important;
      pointer-events:auto!important;
    }
    #tm-root #spot64-customize-dialog .sc-frame-title{
      padding:0!important;margin:0!important;background:transparent!important;
      font-weight:700!important;font-size:15px!important;letter-spacing:1px!important;
    }
    #tm-root #spot64-customize-dialog .sc-head > button {
      position:static!important;margin:0!important;pointer-events:auto!important;
      padding:7px 10px!important;white-space:nowrap!important;
    }
    #tm-root #spot64-customize-dialog .sc-layout {
      display:grid;grid-template-columns:minmax(145px,230px) minmax(0,1fr);
      gap:20px;flex:1 1 auto;min-width:0;min-height:0;overflow:hidden;
      padding-top:16px;
    }
    #tm-root #spot64-customize-dialog .sc-nav {
      display:flex;flex-direction:column;gap:4px;min-height:0;overflow-y:auto;
      padding:0 10px 10px 0;
      border-right:1px solid var(--spot64-ui-border,#444b55);
      scrollbar-width:thin;
    }
    #tm-root #spot64-customize-dialog .sc-nav > button {
      display:block!important;text-align:left!important;width:100%!important;
      padding:10px 12px!important;margin:0!important;
      background:transparent!important;border:0!important;border-radius:2px!important;
      color:var(--spot64-ui-muted,#abb1bc)!important;
      font:inherit!important;white-space:normal!important;
    }
    #tm-root #spot64-customize-dialog .sc-nav > button[aria-current="page"]{
      color:var(--spot64-ui-heading,#eee)!important;
      background:var(--spot64-ui-highlight,#313740)!important;
    }
    #tm-root #spot64-customize-dialog .sc-nav > button:hover {background:var(--spot64-ui-highlight,#313740)!important;}
    #tm-root #spot64-customize-dialog .sc-body {
      display:block!important;min-width:0!important;min-height:0!important;
      padding:0 8px 20px 0!important;margin:0!important;
      overflow-y:auto!important;max-height:none!important;
      scrollbar-width:thin;
    }
    #tm-root #spot64-customize-dialog .sc-section{display:none!important;border-top:0!important;padding:0 0 18px!important;}
    #tm-root #spot64-customize-dialog .sc-section[data-sc-active="true"]{display:block!important;}
    #tm-root #spot64-customize-dialog .sc-section > h3{
      font-size:13px!important;letter-spacing:.08em!important;
      border-bottom:1px solid var(--spot64-ui-border,#444b55)!important;
      padding-bottom:14px!important;margin:0 0 16px!important;
    }
    #tm-root #spot64-customize-dialog .sc-advanced{display:contents!important;}
    #tm-root #spot64-customize-dialog .sc-advanced > summary{display:none!important;}
    #tm-root #spot64-customize-dialog .sc-body > .sc-buttons{margin-top:20px!important;border-top:1px solid var(--spot64-ui-border,#444b55)!important;padding-top:15px!important;}
    #tm-root #spot64-customize-dialog .sc-field{grid-template-columns:minmax(130px,36%) minmax(0,1fr)!important;max-width:760px;}
    #tm-root #spot64-customize-dialog .sc-preview{max-width:760px;}
    @media(max-width:710px){
      #tm-root.st-customize-mode > .tm-main > #spot64-customize-dialog:not([hidden]){padding:12px!important;}
      #tm-root #spot64-customize-dialog .sc-layout{grid-template-columns:minmax(102px,33%) minmax(0,1fr);gap:10px;}
      #tm-root #spot64-customize-dialog .sc-nav > button{padding:8px 4px!important;font-size:11px!important;}
      #tm-root #spot64-customize-dialog .sc-field{grid-template-columns:minmax(0,1fr)!important;gap:5px!important;}
    }
    :root[data-spot64-square-borders="true"] #tm-root.st-customize-mode #spot64-customize-dialog {border-radius:0!important;}
    #tm-root #spot64-customize-dialog .sc-css-files{display:flex;flex-direction:column;gap:8px;margin:10px 0 18px;max-width:760px;}
    #tm-root #spot64-customize-dialog .sc-css-file{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px;border:1px solid var(--spot64-ui-border,#4a5058);background:var(--spot64-ui-field,#171b22);}
    #tm-root #spot64-customize-dialog .sc-css-file .sc-css-name{flex:1 1 160px;min-width:0;overflow-wrap:anywhere;}
    #tm-root #spot64-customize-dialog .sc-css-actions{display:flex;gap:6px;flex-wrap:wrap;}
    #tm-root #spot64-customize-dialog .sc-css-actions button{padding:5px 8px!important;}
    #tm-root #spot64-customize-dialog .sc-css-preview{white-space:pre-wrap;font:11px/1.5 Consolas,monospace;background:var(--spot64-ui-field,#171b22);border:1px solid var(--spot64-ui-border,#4a5058);padding:12px;max-height:140px;overflow:auto;}

  `;
    document.head.append(baseStyle, stylesheet, cssPresetStyle, cssUserStyle, advancedStyle);
    applyCSS();
    let root, dialog, openButton, seek, seekWrapper, seekCharacters, canvas;
    let lastSeekingStyle = null, lastVisualizerStyle = null;
    let displayedFilled = null, targetFilled = 0, lastSeekDraw = 0, previousProgressMs = null;
    function save() { try {
        localStorage.setItem(KEY, JSON.stringify(settings));
    }
    catch (e) {
        console.warn('[Spot64 Customize] Save unavailable', e);
    } }
    const color = (key) => cssValue(settings[key]);
    let wallpaperObjectUrl = null, loadedWallpaperId = null, wallpaperRequest = 0;
    function openWallpaperDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('spot64-wallpapers-v1', 1);
            request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'id' });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Wallpaper storage unavailable'));
        });
    }
    async function storeWallpaper(blob) {
        const db = await openWallpaperDb();
        const id = 'wp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        try {
            await new Promise((resolve, reject) => {
                const tx = db.transaction('images', 'readwrite');
                tx.objectStore('images').put({ id, blob });
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
                tx.onabort = () => reject(tx.error);
            });
        }
        finally {
            db.close();
        }
        return id;
    }
    async function getWallpaper(id) {
        const db = await openWallpaperDb();
        try {
            return await new Promise((resolve, reject) => {
                const request = db.transaction('images', 'readonly').objectStore('images').get(id);
                request.onsuccess = () => resolve(request.result?.blob || null);
                request.onerror = () => reject(request.error);
            });
        }
        finally {
            db.close();
        }
    }
    function clearWallpaperLayer() {
        root?.style.setProperty('--spot64-wallpaper-image', 'none');
        root?.style.setProperty('--spot64-wallpaper-opacity', '0');
        if (wallpaperObjectUrl)
            URL.revokeObjectURL(wallpaperObjectUrl);
        wallpaperObjectUrl = null;
    }
    function applyWallpaper() {
        if (!root)
            return;
        const opacity = Math.min(100, Math.max(0, Number(settings.wallpaperOpacity) || 0));
        root.style.setProperty('--spot64-wallpaper-opacity', String(opacity / 100));
        const id = settings.wallpaperId || '';
        if (id === loadedWallpaperId)
            return;
        loadedWallpaperId = id;
        const request = ++wallpaperRequest;
        clearWallpaperLayer();
        if (!id)
            return;
        getWallpaper(id).then(blob => {
            if (request !== wallpaperRequest || id !== settings.wallpaperId)
                return;
            if (!blob) {
                console.warn('[Spot64] Saved wallpaper image is unavailable');
                return;
            }
            wallpaperObjectUrl = URL.createObjectURL(blob);
            root.style.setProperty('--spot64-wallpaper-image', `url("${wallpaperObjectUrl}")`);
            root.style.setProperty('--spot64-wallpaper-opacity', String(Math.min(100, Math.max(0, Number(settings.wallpaperOpacity) || 0)) / 100));
        }).catch(error => console.warn('[Spot64] Wallpaper could not load:', error));
    }
    function syncMenuTheme() {
        if (!root)
            return;
        const panel = root.querySelector('.tm-playlists') || root.querySelector('.tm-panel');
        const panelCss = panel ? getComputedStyle(panel) : getComputedStyle(root);
        const rootCss = getComputedStyle(root);
        const heading = root.querySelector('.tm-title');
        const headingCss = heading ? getComputedStyle(heading) : rootCss;
        const dest = document.documentElement;
        const set = (key, value) => dest.style.setProperty('--spot64-ui-' + key, value);
        const panelColor = color('panelBg') || (panelCss.backgroundColor !== 'rgba(0, 0, 0, 0)' ? panelCss.backgroundColor : '#1a1c22');
        set('panel', panelColor);
        set('main', color('mainBg') || getComputedStyle(root).backgroundColor || '#17191e');
        set('text', color('text') || rootCss.color);
        set('muted', color('muted') || '#aaaeb9');
        set('heading', color('heading') || headingCss.color);
        set('button', color('button') || rootCss.color);
        set('highlight', color('highlight') || '#30343d');
        set('field', panelColor);
        set('font', rootCss.fontFamily);
        set('size', rootCss.fontSize);
        set('heading-size', headingCss.fontSize);
        set('border', color('borderColor') || rootCss.getPropertyValue('--tm-line').trim() || panelCss.borderTopColor || '#696c74');
        set('border-width', panelCss.borderTopWidth || '1px');
        set('border-style', settings.borderStyle === 'square' ? 'solid' : (STYLES.includes(settings.borderStyle) ? settings.borderStyle : (STYLES.includes(panelCss.borderTopStyle) ? panelCss.borderTopStyle : 'solid')));
        set('radius', settings.borderStyle === 'square' ? '0px' : (panelCss.borderTopLeftRadius || '8px'));
        dest.dataset.spot64SquareBorders = String(settings.borderStyle === 'square');
        const gradient = Boolean(settings.borderGradient && color('borderColor') && color('borderColor2') && (!settings.borderStyle || settings.borderStyle === 'solid' || settings.borderStyle === 'square'));
        dest.dataset.spot64MenuGradient = String(gradient);
        if (gradient)
            set('gradient', `linear-gradient(135deg,${color('borderColor')},${color('borderColor2')})`);
    }
    function apply() {
        if (!root)
            return;
        if (settings.borderStyle && !STYLES.includes(settings.borderStyle)) {
            settings.borderStyle = 'solid';
            save();
        }
        const lines = [];
        const add = (selector, rule) => { if (rule)
            lines.push(`#tm-root ${selector}{${rule}}`); };
        const borderSize = settings.borderSize === '' ? null : Math.max(0, Math.min(8, Number(settings.borderSize)));
        const borderStyle = settings.borderStyle === 'square' ? 'solid' : (STYLES.includes(settings.borderStyle) ? settings.borderStyle : 'solid');
        const borderColor = color('borderColor');
        const borderColor2 = color('borderColor2');
        let br = '';
        if (borderSize !== null && Number.isFinite(borderSize))
            br += `border-width:${borderSize}px!important;`;
        if (settings.borderStyle)
            br += `border-style:${borderStyle}!important;`;
        if (settings.borderStyle === 'square')
            br += 'border-radius:0!important;';
        if (borderColor)
            br += `border-color:${borderColor}!important;`;
        add('.tm-panel', br);
        const pageFrame = '#tm-root.st-customize-mode > .tm-main > #spot64-customize-dialog:not([hidden])';
        lines.push(`${pageFrame}{border-width:var(--spot64-ui-border-width,1px)!important;border-style:var(--spot64-ui-border-style,solid)!important;border-color:var(--spot64-ui-border,#696c74)!important;border-radius:var(--spot64-ui-radius,8px)!important;}`);
        if (settings.borderStyle === 'square')
            lines.push(`${pageFrame}{border-radius:0!important;}`);
        if (settings.borderGradient && borderColor && borderColor2 && (!settings.borderStyle || settings.borderStyle === 'solid' || settings.borderStyle === 'square')) {
            const surface = color('panelBg') || '#111317';
            lines.push(`${pageFrame}{border-color:transparent!important;background-image:linear-gradient(${surface},${surface}),linear-gradient(135deg,${borderColor},${borderColor2})!important;background-origin:padding-box,border-box!important;background-clip:padding-box,border-box!important;}`);
        }
        const headingSurface = color('panelBg') ||
            (settings.borderGradient && borderColor && borderColor2 ? '#111317' : null);
        if (headingSurface)
            lines.push(`#tm-root{--tm-heading-surface:${headingSurface}!important;}`);
        if (settings.borderGradient && borderColor && borderColor2 && (!settings.borderStyle || settings.borderStyle === 'solid' || settings.borderStyle === 'square')) {
            lines.push(`#tm-root .tm-panel {border-color:transparent!important; background-image:linear-gradient(${color('panelBg') || '#111317'},${color('panelBg') || '#111317'}),linear-gradient(135deg,${borderColor},${borderColor2})!important; background-origin:padding-box,border-box!important;background-clip:padding-box,border-box!important;}`);
            if (!settings.borderSize)
                lines.push('#tm-root .tm-panel{border-width:1px!important}');
        }
        if (settings.fontSize) {
            const n = Math.max(9, Math.min(26, Number(settings.fontSize)));
            if (Number.isFinite(n))
                lines.push(`#tm-root{font-size:${n}px!important}`);
        }
        const fontSizeRule = (key, selector, min = 9, max = 30) => {
            if (settings[key] === '')
                return;
            const size = Number(settings[key]);
            if (Number.isFinite(size))
                lines.push(`#tm-root ${selector}{font-size:${Math.max(min, Math.min(max, size))}px!important;}`);
        };
        fontSizeRule('titleFontSize', '.tm-title');
        fontSizeRule('trackFontSize', '.tm-track,.tm-item');
        fontSizeRule('playerFontSize', '.tm-player-row,.tm-player-row button');
        if (settings.fontFamily) {
            const font = esc(settings.fontFamily).replace(/[;{}]/g, '').slice(0, 120);
            lines.push(`#tm-root{--spot64-selected-font:"${font}",Consolas,monospace!important;}`);
        }
        if (settings.headerFontFamily) {
            const font = esc(settings.headerFontFamily).replace(/[;{}]/g, '').slice(0, 120);
            const family = `"${font}",Consolas,monospace`;
            lines.push(`#tm-root .tm-title{font-family:${family}!important}`);
            lines.push(`#spot64-themes-screen .st-gallery-title,#spot64-customize-dialog .sc-head .sc-frame-title{font-family:${family}!important}`);
        }
        if (color('mainBg'))
            lines.push(`#tm-root, #tm-root .tm-main {background-color:${color('mainBg')}!important}`);
        if (color('panelBg'))
            add('.tm-panel', `background-color:${color('panelBg')}!important;`);
        if (color('text'))
            lines.push(`#tm-root{color:${color('text')}!important} #tm-root .tm-panel, #tm-root .tm-player-row{color:${color('text')}!important}`);
        if (color('muted'))
            add('.tm-muted', `color:${color('muted')}!important;`);
        if (color('heading'))
            add('.tm-title', `color:${color('heading')}!important;`);
        if (color('highlight'))
            lines.push(`#tm-root .tm-track:hover,#tm-root .tm-item:hover,#tm-root .tm-track.tm-current,#tm-root .tm-active {background-color:${color('highlight')}!important}`);
        if (color('button'))
            lines.push(`#tm-root button:not(#spot64-customize-open){color:${color('button')}!important}`);
        if (color('progress'))
            lines.push(`#tm-root .tm-seek{accent-color:${color('progress')}!important} #tm-root .sc-seek-characters{color:${color('progress')}!important}`);
        if (color('progressEmpty'))
            lines.push(`#tm-root .sc-seek-unplayed{color:${color('progressEmpty')}!important}`);
        if (color('visualizer'))
            lines.push(`#tm-root .tm-visualizer,#tm-root .tm-wave-text{color:${color('visualizer')}!important}`);
        if (settings.seekStyle !== 'native') {
            lines.push('#tm-root .sc-seek-wrapper{position:relative;width:100%;display:flex;align-items:center;min-height:16px;}');
            lines.push('#tm-root .sc-seek-wrapper .tm-seek{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;opacity:0!important;cursor:pointer;z-index:2;margin:0!important;}');
            lines.push('#tm-root .sc-seek-characters{display:block;white-space:pre;overflow:hidden;width:100%;pointer-events:none;line-height:1.25;color:#eeeeee;font:12px "JetBrainsMonoNL Nerd Font",Consolas,monospace;}');
            fontSizeRule('seekFontSize', '.sc-seek-characters', 8, 30);
        }
        stylesheet.textContent = lines.join('\n');
        const customRules = [];
        const numberRule = (key, min, max) => {
            if (settings[key] === '' || settings[key] === undefined)
                return null;
            const n = Number(settings[key]);
            return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : null;
        };
        const rad = numberRule('panelRadius', 0, 32);
        if (rad !== null)
            customRules.push(`#tm-root#tm-root .tm-panel{border-radius:${rad}px!important;}`);
        const gap = numberRule('panelGap', 0, 32);
        if (gap !== null)
            customRules.push(`#tm-root#tm-root .tm-main,#tm-root#tm-root .tm-side{gap:${gap}px!important;}`);
        const opacity = numberRule('panelOpacity', 0, 100);
        if (opacity !== null)
            customRules.push(`#tm-root#tm-root .tm-panel{background-color:color-mix(in srgb,var(--spot64-ui-panel,#18191b) ${opacity}%,transparent)!important;}`);
        const shadow = numberRule('panelShadow', 0, 30);
        if (shadow !== null)
            customRules.push(`#tm-root#tm-root .tm-panel{box-shadow:0 5px ${shadow}px #0009!important;}`);
        const spacing = numberRule('letterSpacing', 0, 3);
        if (spacing !== null)
            customRules.push(`#tm-root#tm-root{letter-spacing:${spacing}px!important;}`);
        if (color('playerBg'))
            customRules.push(`#tm-root#tm-root .tm-player-row{background-color:${color('playerBg')}!important;}`);
        if (color('buttonBg'))
            customRules.push(`#tm-root#tm-root button:not(.tm-exit){background-color:${color('buttonBg')}!important;}`);
        const raw = typeof settings.advancedCSS === 'string' && settings.advancedCSS.length <= 40000 &&
            !/@import\b|url\s*\(|expression\s*\(|-moz-binding\b/i.test(settings.advancedCSS)
            ? settings.advancedCSS : '';
        advancedStyle.textContent = customRules.join('\n') + '\n' + raw;
        syncMenuTheme();
        if (settings.panelRadius !== '' && Number.isFinite(Number(settings.panelRadius)))
            document.documentElement.style.setProperty('--spot64-ui-radius', Math.max(0, Math.min(32, Number(settings.panelRadius))) + 'px', 'important');
        else
            document.documentElement.style.removeProperty('--spot64-ui-radius');
        applyWallpaper();
        const titles = root.querySelectorAll('.tm-title');
        const library = root.querySelector('.tm-library > .tm-title');
        const playlists = root.querySelector('.tm-playlists > .tm-title');
        if (library)
            library.textContent = settings.libraryTitle || 'Spot64';
        if (playlists)
            playlists.textContent = settings.playlistsTitle || 'PLAYLISTS';
        const music = root.querySelector('.tm-browser-head > .tm-title');
        if (music) {
            const lastDefault = music.dataset.scAppliedHeading;
            const stillDefault = music.textContent === 'YOUR MUSIC' ||
                (music.dataset.scDefault === 'true' && !!lastDefault && music.textContent === lastDefault);
            if (stillDefault) {
                const nextDefault = settings.musicTitle || 'YOUR MUSIC';
                music.textContent = nextDefault;
                music.dataset.scDefault = 'true';
                music.dataset.scAppliedHeading = nextDefault;
            }
            else {
                delete music.dataset.scDefault;
                delete music.dataset.scAppliedHeading;
            }
        }
        if (seek && settings.seekStyle !== lastSeekingStyle) {
            if (seekCharacters)
                delete seekCharacters.dataset.seekText;
            setupSeek();
            lastSeekingStyle = settings.seekStyle;
        }
        drawSeek(true);
        if (settings.visualizerStyle !== lastVisualizerStyle) {
            refreshVisualStyle();
            lastVisualizerStyle = settings.visualizerStyle;
        }
    }
    function setupSeek() {
        if (!seek || !seek.parentElement)
            return;
        if (settings.seekStyle === 'native') {
            if (seekWrapper) {
                seekWrapper.parentNode?.insertBefore(seek, seekWrapper);
                seekWrapper.remove();
                seekWrapper = null;
                seekCharacters = null;
                displayedFilled = null;
                previousProgressMs = null;
            }
            return;
        }
        if (!seekWrapper) {
            seekWrapper = make('div', 'sc-seek-wrapper');
            seekCharacters = make('pre', 'sc-seek-characters');
            seek.parentNode.insertBefore(seekWrapper, seek);
            seekWrapper.append(seekCharacters, seek);
            new ResizeObserver(() => drawSeek(true)).observe(seekWrapper);
            displayedFilled = null;
            previousProgressMs = null;
        }
    }
    function drawSeek(reset = false) {
        if (!seekCharacters || !seekWrapper || !seekWrapper.isConnected)
            return;
        const ctx = (canvas ||= document.createElement('canvas')).getContext('2d');
        const computed = getComputedStyle(seekCharacters);
        ctx.font = `${computed.fontSize} ${computed.fontFamily}`;
        const glyphs = {
            blocks: ['█', '░'], x: ['X', '·'], slashes: ['/', '·'], segments: ['|', '·'],
            arrow: ['=', ' '], hash: ['#', '.'], spectrum: ['▉', '▥'], braille: ['⣶', '⣀'],
            asterisk: ['*', '-'], command: ['=', ' '], solid: ['▰', '▱'],
            bars: ['▮', '▯'], squares: ['■', '□'], dots: ['￭', '･']
        };
        const style = settings.seekStyle;
        const chars = glyphs[style] || glyphs.blocks;
        const width = Math.max(ctx.measureText(chars[0]).width, ctx.measureText(chars[1]).width, ctx.measureText('M').width);
        const framed = style === 'arrow' || style === 'hash';
        const arrow = style === 'arrow' || style === 'command';
        const reserved = (framed ? 2 : style === 'command' ? 1 : 0);
        const count = Math.max(1, Math.floor((seekWrapper.clientWidth - 2) / Math.max(1, width)) - reserved);
        const player = window.Spicetify?.Player;
        const duration = Number(player?.getDuration?.()) || 0;
        const current = Number(player?.getProgress?.()) || 0;
        const progress = duration > 0 ? current / duration : (Number(seek.value) || 0) / 100;
        const rewound = previousProgressMs !== null && current < previousProgressMs - 1000;
        previousProgressMs = current;
        targetFilled = Math.max(0, Math.min(count, Math.floor(count * progress)));
        if (displayedFilled === null || reset || rewound || displayedFilled > count)
            displayedFilled = targetFilled;
        if (displayedFilled < targetFilled)
            displayedFilled++;
        else if (displayedFilled > targetFilled)
            displayedFilled = targetFilled;
        let playedText = chars[0].repeat(displayedFilled);
        let remainingText = chars[1].repeat(count - displayedFilled);
        if (arrow) {
            if (displayedFilled < count) {
                remainingText = '>' + chars[1].repeat(Math.max(0, count - displayedFilled - 1));
            }
            else {
                playedText = chars[0].repeat(Math.max(0, count - 1)) + '>';
            }
        }
        if (framed) {
            playedText = '[' + playedText;
            remainingText += ']';
        }
        else if (style === 'command')
            playedText = '\\' + playedText;
        const nextText = playedText + remainingText;
        if (seekCharacters.dataset.seekText === nextText)
            return;
        seekCharacters.dataset.seekText = nextText;
        seekCharacters.replaceChildren();
        const played = make('span', 'sc-seek-played', playedText);
        const remaining = make('span', 'sc-seek-unplayed', remainingText);
        seekCharacters.append(played, remaining);
    }
    function refreshVisualStyle() {
        const output = root?.querySelector('.tm-wave-text');
        if (!output)
            return;
        const replace = () => {
            const glyph = { blocks: '█', thin: '│', dots: '●', pixels: '▪' }[settings.visualizerStyle] || '█';
            if (glyph === '█')
                return;
            const next = output.textContent.replace(/█/g, glyph);
            if (next !== output.textContent)
                output.textContent = next;
        };
        if (!output.dataset.scWatch) {
            output.dataset.scWatch = '1';
            new MutationObserver(() => { replace(); }).observe(output, { childList: true, characterData: true, subtree: true });
        }
        replace();
    }
    let contentBody, activeCustomizeSection = 'background', customizeFromArtwork = false, customizeNavObserver = null, showAdvancedCustomize = false;
    const section = (name, parent = contentBody) => { const s = make('section', 'sc-section'); s.append(make('h3', '', name)); parent.append(s); return s; };
    const field = (where, label, node) => { const row = make('div', 'sc-field'); const l = make('label', '', label); row.append(l, node); where.append(row); return node; };
    function bind(where, key, label, type, options) {
        let input;
        if (options) {
            input = make('select');
            for (const [value, name] of options) {
                const opt = make('option', '', name);
                opt.value = value;
                input.append(opt);
            }
            input.value = settings[key];
        }
        else {
            input = make('input');
            input.type = type;
            if (type === 'checkbox')
                input.checked = !!settings[key];
            else if (type === 'color')
                input.value = color(key) || '#ffffff';
            else
                input.value = settings[key];
            if (type === 'number') {
                input.min = '0';
                input.max = key === 'borderSize' ? '8' : key === 'panelOpacity' ? '100' : key === 'panelRadius' || key === 'panelGap' || key === 'panelShadow' ? '32' : key === 'letterSpacing' ? '3' : '30';
                input.step = key === 'letterSpacing' ? '0.1' : '1';
                input.placeholder = 'Default';
            }
        }
        input.title = label;
        input.addEventListener(type === 'text' || (type === 'number' && key !== 'borderSize') ? 'change' : 'input', () => {
            settings[key] = type === 'checkbox' ? input.checked : input.value;
            save();
            apply();
        });
        return field(where, label, input);
    }
    function colorField(where, key, label) {
        const wrap = make('div');
        wrap.style.cssText = 'display:flex;align-items:center;gap:6px';
        const enable = make('input');
        enable.type = 'checkbox';
        enable.checked = !!color(key);
        enable.title = `Customize ${label}`;
        const picker = make('input');
        picker.type = 'color';
        picker.value = color(key) || '#ffffff';
        picker.disabled = !enable.checked;
        enable.addEventListener('change', () => { picker.disabled = !enable.checked; settings[key] = enable.checked ? picker.value : ''; save(); apply(); });
        picker.addEventListener('input', () => { settings[key] = picker.value; save(); apply(); });
        wrap.append(enable, picker);
        field(where, label, wrap);
    }
    function closeCustomize(restoreArtwork = true) {
        if (!dialog || dialog.hidden)
            return;
        dialog.hidden = true;
        root?.classList.remove('st-customize-mode');
        if (restoreArtwork && customizeFromArtwork)
            root?.querySelector('.tm-art-toggle')?.click();
        customizeFromArtwork = false;
    }
    function openCustomize() {
        if (!root || !dialog)
            return;
        if (!dialog.hidden) {
            closeCustomize();
            return;
        }
        if (root.classList.contains('st-themes-mode')) {
            const back = root.querySelector('#spot64-themes-screen .st-gallery-header button');
            back?.click();
        }
        customizeFromArtwork = root.classList.contains('tm-art-mode');
        if (customizeFromArtwork)
            root.querySelector('.tm-art-toggle')?.click();
        dialog.hidden = false;
        root.classList.add('st-customize-mode');
        refreshCustomizeNavigation();
    }
    function refreshCustomizeNavigation() {
        if (!dialog || !contentBody)
            return;
        const nav = dialog.querySelector('.sc-nav');
        if (!nav)
            return;
        const sections = Array.from(contentBody.querySelectorAll('.sc-section'));
        if (!sections.length)
            return;
        const seen = new Set();
        for (const part of sections) {
            const title = part.querySelector(':scope > h3')?.textContent || 'SETTINGS';
            const id = part.id === 'spot64-dither-customize' ? 'dither' : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            part.dataset.scCategory = id;
            seen.add(id);
        }
        if (!seen.has(activeCustomizeSection))
            activeCustomizeSection = sections[0].dataset.scCategory;
        const basic = sections.filter(part => !part.closest('.sc-advanced'));
        const advanced = sections.filter(part => !!part.closest('.sc-advanced'));
        if (!showAdvancedCustomize && advanced.some(part => part.dataset.scCategory === activeCustomizeSection))
            activeCustomizeSection = 'background';
        const navLabel = (title) => make('div', 'sc-nav-group', title);
        const navButton = (part) => {
            const btn = make('button', '', part.querySelector(':scope > h3')?.textContent || 'SETTINGS');
            btn.type = 'button';
            btn.dataset.scTarget = part.dataset.scCategory;
            btn.setAttribute('aria-current', part.dataset.scCategory === activeCustomizeSection ? 'page' : 'false');
            btn.addEventListener('click', () => { activeCustomizeSection = part.dataset.scCategory; updateCustomizeCategory(); });
            return btn;
        };
        const advancedToggle = make('button', 'sc-nav-advanced-toggle', showAdvancedCustomize ? '▾ ADVANCED SETTINGS' : '▸ ADVANCED SETTINGS');
        advancedToggle.type = 'button';
        advancedToggle.setAttribute('aria-expanded', String(showAdvancedCustomize));
        advancedToggle.addEventListener('click', () => { showAdvancedCustomize = !showAdvancedCustomize; refreshCustomizeNavigation(); });
        nav.replaceChildren(navLabel('APPEARANCE'), ...basic.map(navButton), advancedToggle, ...(showAdvancedCustomize ? [navLabel('ADVANCED'), ...advanced.map(navButton)] : []));
        updateCustomizeCategory();
    }
    function updateCustomizeCategory() {
        if (!dialog || !contentBody)
            return;
        for (const part of contentBody.querySelectorAll('.sc-section'))
            part.dataset.scActive = String(part.dataset.scCategory === activeCustomizeSection);
        for (const btn of dialog.querySelectorAll('.sc-nav > button'))
            btn.setAttribute('aria-current', btn.dataset.scTarget === activeCustomizeSection ? 'page' : 'false');
        contentBody.scrollTop = 0;
    }
    function buildFocusToggle() {
        if (root?.querySelector('#spot64-focus-toggle'))
            return;
        const toggle = make('button', '', '-');
        toggle.id = 'spot64-focus-toggle';
        toggle.type = 'button';
        const KEY = 'spot64.focus.minimized.v1';
        let collapsed = false;
        try {
            collapsed = localStorage.getItem(KEY) === 'true';
        }
        catch (_) { }
        const setFocus = value => {
            collapsed = !!value;
            root.classList.toggle('st-focus-mode', collapsed);
            toggle.textContent = collapsed ? '+' : '-';
            toggle.title = collapsed ? 'Restore Library, Playlists, Queue and current playlist' : 'Minimize Library, Playlists, Queue and current playlist';
            toggle.setAttribute('aria-label', toggle.title);
            toggle.setAttribute('aria-pressed', String(collapsed));
            try {
                localStorage.setItem(KEY, String(collapsed));
            }
            catch (_) { }
        };
        toggle.addEventListener('click', () => {
            if (collapsed && root.classList.contains('tm-art-mode')) {
                root.querySelector('.tm-art-toggle')?.click();
            }
            setFocus(!collapsed);
        });
        const attach = () => {
            const quick = root?.querySelector(':scope > .st-quick-row');
            if (!quick)
                return false;
            quick.append(toggle);
            return true;
        };
        if (!attach()) {
            const observer = new MutationObserver(() => { if (attach())
                observer.disconnect(); });
            observer.observe(root, { childList: true });
        }
        setFocus(collapsed);
    }
    function buildFooterVolume() {
        const row = root?.querySelector(':scope > .tm-footer > .tm-player-row');
        const player = window.Spicetify?.Player;
        if (!row || typeof player?.getVolume !== 'function' || typeof player?.setVolume !== 'function' || row.querySelector('.spot64-volume-control'))
            return;
        const el = (tag, cls) => { const n = document.createElement(tag); n.className = cls; return n; };
        const control = el('div', 'spot64-volume-control');
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', 'Spotify volume');
        const mute = el('button', 'spot64-volume-toggle');
        mute.type = 'button';
        mute.title = 'Mute';
        mute.setAttribute('aria-label', 'Mute');
        mute.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path class="spot64-volume-waves" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5a10 10 0 0 1 0 14"/><path class="spot64-volume-cross" d="m16 9 5 6m0-6-5 6"/></svg>';
        const slider = el('input', 'spot64-volume-slider');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.step = '1';
        slider.setAttribute('aria-label', 'Spotify volume');
        const amount = el('span', 'spot64-volume-amount');
        amount.setAttribute('aria-hidden', 'true');
        control.append(mute, slider, amount);
        row.parentElement.insertBefore(control, row);
        row.parentElement.classList.add('spot64-volume-row-v2');
        const clamp = (n) => Math.min(1, Math.max(0, Number(n) || 0));
        let lastAudible = 0.5;
        let userUpdateUntil = 0;
        const read = () => { try {
            return clamp(player.getVolume());
        }
        catch (_) {
            return 0;
        } };
        const muted = () => { try {
            return typeof player.getMute === 'function' && !!player.getMute();
        }
        catch (_) {
            return false;
        } };
        const paint = (volume, isMuted) => {
            const pct = Math.round(clamp(volume) * 100);
            slider.value = String(pct);
            slider.style.setProperty('--spot64-volume-fill', pct + '%');
            amount.textContent = pct + '%';
            const silent = isMuted || pct === 0;
            mute.dataset.muted = String(silent);
            mute.title = silent ? 'Unmute' : 'Mute';
            mute.setAttribute('aria-label', mute.title);
            mute.setAttribute('aria-pressed', String(silent));
            if (!silent && volume > 0)
                lastAudible = volume;
        };
        const sync = () => {
            if (Date.now() < userUpdateUntil)
                return;
            const v = read();
            paint(v, muted());
        };
        paint(read(), muted());
        slider.addEventListener('input', () => {
            const v = clamp(Number(slider.value) / 100);
            userUpdateUntil = Date.now() + 900;
            paint(v, v === 0);
            try {
                if (v > 0 && muted() && typeof player.setMute === 'function')
                    player.setMute(false);
                player.setVolume(v);
            }
            catch (error) {
                console.warn('[Spot64 volume] Could not set volume', error);
            }
        });
        mute.addEventListener('click', () => {
            userUpdateUntil = Date.now() + 900;
            const current = read();
            const isSilent = muted() || current === 0;
            try {
                if (isSilent) {
                    const target = current > 0 ? current : lastAudible;
                    if (current === 0)
                        player.setVolume(target);
                    if (typeof player.setMute === 'function')
                        player.setMute(false);
                    paint(target, false);
                }
                else {
                    if (typeof player.setMute === 'function')
                        player.setMute(true);
                    else
                        player.setVolume(0);
                    paint(current, true);
                }
            }
            catch (error) {
                console.warn('[Spot64 volume] Could not toggle mute', error);
            }
        });
        const poll = setInterval(() => {
            if (!control.isConnected) {
                clearInterval(poll);
                return;
            }
            if (document.hidden)
                return;
            sync();
        }, 800);
    }
    function buildDialog() {
        dialog = make('div');
        dialog.id = 'spot64-customize-dialog';
        dialog.hidden = true;
        dialog.setAttribute('role', 'region');
        dialog.setAttribute('aria-label', 'Spot64 customization page');
        const top = make('div', 'sc-head');
        top.append(make('span', 'sc-frame-title', 'Spot64 / Customize'));
        const close = make('button', '', 'BACK TO Spot64');
        close.type = 'button';
        close.onclick = () => { closeCustomize(); openButton.focus(); };
        top.append(close);
        dialog.append(top);
        const layout = make('div', 'sc-layout');
        const nav = make('nav', 'sc-nav');
        nav.setAttribute('aria-label', 'Customize categories');
        contentBody = make('div', 'sc-body');
        layout.append(nav, contentBody);
        dialog.append(layout);
        const background = section('BACKGROUND');
        colorField(background, 'mainBg', 'Main background');
        colorField(background, 'panelBg', 'Panel background');
        const wallpaperRow = make('div', 'sc-wallpaper-row');
        const chooseWallpaper = make('button', '', 'Choose image');
        chooseWallpaper.type = 'button';
        const wallpaperName = make('span', 'sc-wallpaper-name', settings.wallpaperName || 'None');
        const removeWallpaper = make('button', '', 'Remove');
        removeWallpaper.type = 'button';
        removeWallpaper.disabled = !settings.wallpaperId;
        const wallpaperFile = make('input');
        wallpaperFile.type = 'file';
        wallpaperFile.accept = 'image/png,image/jpeg,image/webp';
        wallpaperFile.hidden = true;
        chooseWallpaper.onclick = () => wallpaperFile.click();
        wallpaperFile.addEventListener('change', async () => {
            const file = wallpaperFile.files?.[0];
            if (!file)
                return;
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) {
                window.Spicetify?.showNotification?.('Choose a PNG, JPG or WebP under 12 MB', true);
                return;
            }
            chooseWallpaper.disabled = true;
            try {
                const id = await storeWallpaper(file);
                settings.wallpaperId = id;
                settings.wallpaperName = file.name;
                settings.wallpaperOpacity = 10;
                wallpaperName.textContent = file.name;
                removeWallpaper.disabled = false;
                wallpaperOpacity.disabled = false;
                wallpaperOpacity.value = '10';
                wallpaperValue.textContent = '10%';
                save();
                apply();
            }
            catch (error) {
                console.warn('[Spot64] Wallpaper could not save:', error);
                window.Spicetify?.showNotification?.('Wallpaper could not be stored', true);
            }
            finally {
                chooseWallpaper.disabled = false;
                wallpaperFile.value = '';
            }
        });
        removeWallpaper.onclick = () => {
            settings.wallpaperId = '';
            settings.wallpaperName = '';
            settings.wallpaperOpacity = 10;
            wallpaperName.textContent = 'None';
            removeWallpaper.disabled = true;
            wallpaperOpacity.disabled = true;
            wallpaperOpacity.value = '10';
            wallpaperValue.textContent = '—';
            save();
            apply();
        };
        wallpaperRow.append(chooseWallpaper, wallpaperName, removeWallpaper, wallpaperFile);
        field(background, 'Wallpaper', wallpaperRow);
        const opacityRow = make('div', 'sc-wallpaper-row');
        const wallpaperOpacity = make('input', 'sc-wallpaper-slider');
        wallpaperOpacity.type = 'range';
        wallpaperOpacity.min = '0';
        wallpaperOpacity.max = '100';
        wallpaperOpacity.step = '1';
        wallpaperOpacity.value = String(Math.min(100, Math.max(0, Number(settings.wallpaperOpacity) || 0)));
        const wallpaperValue = make('span', '', settings.wallpaperId ? wallpaperOpacity.value + '%' : '—');
        wallpaperOpacity.disabled = !settings.wallpaperId;
        wallpaperOpacity.addEventListener('input', () => {
            settings.wallpaperOpacity = Number(wallpaperOpacity.value);
            wallpaperValue.textContent = wallpaperOpacity.value + '%';
            save();
            apply();
        });
        opacityRow.append(wallpaperOpacity, wallpaperValue);
        field(background, 'Opacity', opacityRow);
        const borders = section('PANEL BORDERS');
        bind(borders, 'borderSize', 'Thickness (px)', 'number');
        bind(borders, 'borderStyle', 'Style', 'select', [['', 'Current/default'], ['solid', 'Solid'], ['double', 'Double'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['square', 'Square (sharp corners)']]);
        colorField(borders, 'borderColor', 'Border colour');
        const fonts = section('FONTS');
        bind(fonts, 'fontSize', 'Overall size (px)', 'number');
        const fontField = make('div');
        const fontInput = make('input');
        fontInput.type = 'text';
        fontInput.placeholder = 'Installed font family name';
        fontInput.value = settings.fontFamily;
        const updateFont = () => { settings.fontFamily = fontInput.value.trim(); save(); apply(); };
        fontInput.addEventListener('input', updateFont);
        fontInput.addEventListener('change', updateFont);
        const fontOptions = make('datalist');
        fontOptions.id = 'spot64-installed-fonts';
        fontInput.setAttribute('list', fontOptions.id);
        fontField.append(fontInput, fontOptions);
        field(fonts, 'Font family', fontField);
        const headerFontInput = make('input');
        headerFontInput.type = 'text';
        headerFontInput.placeholder = 'Use body font (default)';
        headerFontInput.value = settings.headerFontFamily || '';
        headerFontInput.setAttribute('list', fontOptions.id);
        headerFontInput.addEventListener('input', () => {
            settings.headerFontFamily = headerFontInput.value.trim();
            save();
            apply();
        });
        field(fonts, 'Header font family', headerFontInput);
        const fontButton = make('button', '', 'FIND INSTALLED FONTS');
        const fontStatus = make('p', 'sc-message', '');
        fontButton.onclick = async () => {
            if (typeof window.queryLocalFonts !== 'function') {
                fontStatus.textContent = 'Font listing unavailable in this Spotify build. Type an installed font name above instead.';
                return;
            }
            try {
                const list = await window.queryLocalFonts();
                const families = [...new Set(list.map(x => x.family).filter(Boolean))].sort();
                fontOptions.replaceChildren(...families.map(name => { const o = make('option'); o.value = name; return o; }));
                fontStatus.textContent = `Found ${families.length} installed font families. Choose from the font-name suggestions.`;
            }
            catch (e) {
                fontStatus.textContent = 'Spotify could not access the installed-font list. You can still enter a font name manually.';
            }
        };
        fonts.append(fontButton, fontStatus);
        const advanced = make('details', 'sc-advanced');
        advanced.append(make('summary', '', 'ADVANCED SETTINGS'));
        advanced.open = true;
        contentBody.append(advanced);
        const borderExtra = section('GRADIENT BORDERS', advanced);
        bind(borderExtra, 'borderGradient', 'Enable gradient', 'checkbox');
        colorField(borderExtra, 'borderColor2', 'Gradient end colour');
        borderExtra.append(make('p', 'sc-hint', 'Smooth gradients apply with solid borders. Choosing dotted, dashed or double uses that pattern instead, without deleting your gradient colours.'));
        const fontExtra = section('DETAILED FONT SIZES', advanced);
        bind(fontExtra, 'titleFontSize', 'Heading size (px)', 'number');
        bind(fontExtra, 'trackFontSize', 'Track/list size (px)', 'number');
        bind(fontExtra, 'playerFontSize', 'Player size (px)', 'number');
        bind(fontExtra, 'seekFontSize', 'Seek symbols size (px)', 'number');
        const detail = section('LAYOUT & COMPONENTS', advanced);
        bind(detail, 'panelRadius', 'Panel corner radius (px)', 'number');
        bind(detail, 'panelOpacity', 'Panel opacity (0–100%)', 'number');
        bind(detail, 'panelGap', 'Panel spacing (px)', 'number');
        bind(detail, 'panelShadow', 'Panel shadow blur (px)', 'number');
        bind(detail, 'letterSpacing', 'Letter spacing (px)', 'number');
        colorField(detail, 'playerBg', 'Playback bar background');
        colorField(detail, 'buttonBg', 'Button background');
        detail.append(make('p', 'sc-hint', 'Leave fields empty or colours unchecked to inherit the current preset. Extreme layout values may affect small windows.'));
        const expert = section('ADVANCED CSS EDITOR', advanced);
        expert.append(make('p', 'sc-hint', 'Optional CSS overrides for properties not covered by the visual controls. This editor applies after presets and imported styles. It is saved with your Spot64 theme. Use trusted CSS only.'));
        const source = make('textarea');
        source.id = 'spot64-advanced-source';
        source.spellcheck = false;
        source.value = settings.advancedCSS || '';
        source.rows = 12;
        source.maxLength = 40000;
        source.placeholder = '#tm-root .tm-panel { /* Your CSS override */ }';
        source.style.cssText = 'display:block;width:100%;max-width:760px;min-height:170px;resize:vertical;font:12px/1.5 Consolas,monospace;padding:12px;white-space:pre;tab-size:2;';
        const cssNotice = make('p', 'sc-message', '');
        const commit = make('button', '', 'APPLY CSS');
        commit.type = 'button';
        commit.addEventListener('click', () => {
            const v = source.value;
            if (v.length > 40000 || /@import\b|url\s*\(|expression\s*\(|-moz-binding\b/i.test(v)) {
                cssNotice.textContent = 'External imports/URLs are not allowed. Maximum 40 KB.';
                return;
            }
            const previous = settings.advancedCSS;
            settings.advancedCSS = v;
            save();
            apply();
            cssNotice.textContent = 'Applied and saved. Use Themes → Save Current Theme to keep this version.';
        });
        const clear = make('button', '', 'CLEAR OVERRIDES');
        clear.type = 'button';
        clear.addEventListener('click', () => { source.value = ''; settings.advancedCSS = ''; save(); apply(); cssNotice.textContent = 'Advanced CSS overrides cleared.'; });
        expert.append(source, commit, clear, cssNotice);
        const titles = section('WINDOW TITLES', advanced);
        bind(titles, 'libraryTitle', 'Library heading', 'text');
        bind(titles, 'playlistsTitle', 'Playlists heading', 'text');
        bind(titles, 'musicTitle', 'Default music heading', 'text');
        titles.append(make('p', 'sc-hint', 'The music heading changes to show the selected playlist or search.'));
        const colors = section('COLOURS');
        for (const [key, label] of [['text', 'Main text'], ['muted', 'Muted text'], ['heading', 'Section headings'], ['highlight', 'Selection / hover'], ['button', 'Button text'], ['progress', 'Seek played symbols'], ['progressEmpty', 'Seek unplayed symbols']])
            colorField(colors, key, label);
        const swapRow = make('div', 'sc-buttons');
        const swappable = [['mainBg', 'Main background'], ['panelBg', 'Panel backgrounds'], ['borderColor', 'Borders'], ['text', 'Main text'], ['muted', 'Muted text'], ['heading', 'Headings'], ['highlight', 'Highlight'], ['button', 'Buttons'], ['progress', 'Played symbols'], ['progressEmpty', 'Unplayed symbols']];
        const makeSwapSelect = () => { const select = make('select'); for (const [key, label] of swappable) {
            const option = make('option', '', label);
            option.value = key;
            select.append(option);
        } return select; };
        const left = makeSwapSelect(), right = makeSwapSelect();
        right.value = 'text';
        const swap = make('button', '', 'SWAP THESE COLOURS');
        swap.type = 'button';
        const swapMessage = make('p', 'sc-message', '');
        swap.onclick = () => {
            if (left.value === right.value) {
                swapMessage.textContent = 'Choose two different colours.';
                return;
            }
            if (!color(left.value) || !color(right.value)) {
                swapMessage.textContent = 'Enable and set both colours first.';
                return;
            }
            [settings[left.value], settings[right.value]] = [settings[right.value], settings[left.value]];
            const wasOpen = !dialog.hidden;
            save();
            apply();
            dialog.remove();
            buildDialog();
            dialog.hidden = !wasOpen;
            if (wasOpen)
                root.classList.add('st-customize-mode');
        };
        swapRow.append(left, right, swap);
        colors.append(swapRow, swapMessage);
        colors.append(make('p', 'sc-hint', 'Swap exchanges two enabled colour values.'));
        const seekS = section('SEEK BAR');
        bind(seekS, 'seekStyle', 'Style', 'select', [
            ['native', 'Original (unchanged)'], ['blocks', '████ / ░░░░'],
            ['x', 'XXXX / ····'], ['slashes', '//// / ····'], ['segments', '|||| / ····'],
            ['arrow', '[====>      ]'], ['hash', '[####......]'],
            ['spectrum', '▉▉▉▥▥▥'], ['braille', '⣶⣶⣶⣀⣀⣀'],
            ['asterisk', '*****-----'], ['command', '\\====>      '],
            ['solid', '▰▰▰▱▱▱'], ['bars', '▮▮▮▯▯▯'],
            ['squares', '■■■□□□'], ['dots', '￭￭￭･･･']
        ]);
        seekS.append(make('p', 'sc-hint', 'Text and glyph styles display over the original seek control. Clicking or dragging still seeks through the track.'));
        const cssArea = section('CUSTOM CSS', advanced);
        cssArea.append(make('p', 'sc-hint', 'Import CSS files for layout, colours or typography. Apply changes live, then use Themes → Save Current Theme to keep a named version. Preinstalled themes are available in Themes.'));
        const fileControl = make('input');
        fileControl.type = 'file';
        fileControl.accept = '.css,text/css';
        fileControl.multiple = true;
        fileControl.hidden = true;
        const importBtn = make('button', '', 'IMPORT CSS FILES');
        importBtn.type = 'button';
        importBtn.onclick = () => fileControl.click();
        const cssList = make('div', 'sc-css-files');
        const cssStatus = make('p', 'sc-message', '');
        function refreshCssList() {
            cssList.replaceChildren();
            if (!cssState.files.length) {
                cssList.append(make('p', 'sc-hint', 'No imported stylesheets. Your theme remains unchanged.'));
                return;
            }
            cssState.files.forEach((f, index) => {
                const item = make('div', 'sc-css-file');
                const toggle = make('input');
                toggle.type = 'checkbox';
                toggle.checked = f.enabled;
                toggle.title = `Enable ${f.name}`;
                toggle.addEventListener('change', () => { f.enabled = toggle.checked; saveCSS(); applyCSS(); });
                const label = make('span', 'sc-css-name', f.name);
                const actions = make('div', 'sc-css-actions');
                const download = make('button', '', 'EXPORT');
                download.type = 'button';
                download.onclick = () => saveCSSFile(f.name, f.css);
                const remove = make('button', '', 'REMOVE');
                remove.type = 'button';
                remove.onclick = () => { cssState.files.splice(index, 1); saveCSS(); applyCSS(); refreshCssList(); };
                actions.append(download, remove);
                item.append(toggle, label, actions);
                cssList.append(item);
            });
        }
        fileControl.addEventListener('change', async () => {
            cssStatus.textContent = '';
            const files = Array.from(fileControl.files || []);
            let imported = 0;
            for (const f of files) {
                if (cssState.files.length >= CSS_MAX_FILES) {
                    cssStatus.textContent = `Maximum ${CSS_MAX_FILES} files reached.`;
                    break;
                }
                if (!/\.css$/i.test(f.name) || f.size > CSS_MAX_FILE) {
                    cssStatus.textContent = 'Only .css files up to 100 KB each are supported.';
                    continue;
                }
                try {
                    const content = await f.text();
                    if (/@import\b|url\s*\(|expression\s*\(|-moz-binding\b/i.test(content)) {
                        cssStatus.textContent = `${f.name}: external resources / imports are not supported.`;
                        continue;
                    }
                    if (cssState.files.reduce((n, entry) => n + entry.css.length, 0) + content.length > CSS_MAX_TOTAL) {
                        cssStatus.textContent = 'Total imported CSS exceeds 350 KB.';
                        break;
                    }
                    cssState.files.push({ name: f.name.slice(0, 120), css: content, enabled: true });
                    if (!saveCSS()) {
                        cssState.files.pop();
                        cssStatus.textContent = 'Could not save CSS. Browser storage may be full.';
                        break;
                    }
                    imported++;
                }
                catch (e) {
                    console.warn('[Spot64 CSS] Import failed', e);
                    cssStatus.textContent = `Could not read ${f.name}.`;
                }
            }
            fileControl.value = '';
            applyCSS();
            refreshCssList();
            if (imported)
                cssStatus.textContent = `Imported ${imported} stylesheet${imported === 1 ? '' : 's'}. Changes applied live.`;
        });
        cssArea.append(importBtn, fileControl, cssList, cssStatus);
        const exportActive = make('button', '', 'EXPORT ACTIVE CSS');
        exportActive.type = 'button';
        exportActive.onclick = () => {
            const all = [presetCSS(cssState.preset), ...cssState.files.filter(f => f.enabled).map(f => f.css)].filter(Boolean).join('\n\n');
            if (!all) {
                cssStatus.textContent = 'No active CSS layer to export. The original Spot64 stylesheet is installed separately.';
                return;
            }
            saveCSSFile('spot64-active-styles.css', all);
        };
        cssArea.append(exportActive);
        cssArea.append(make('p', 'sc-hint', 'EXPORT ACTIVE CSS includes enabled imports and any selected built-in theme overlay; it does not export Spot64 engine files. Import trusted CSS only. Emergency reset: Ctrl + Alt + Shift + 0 disables custom CSS and preset overlays.'));
        refreshCssList();
        const bottom = make('div', 'sc-buttons');
        const reset = make('button', '', 'RESTORE ALL DEFAULTS');
        reset.onclick = () => {
            if (!window.confirm('Restore all Spot64 Customize settings to their original defaults?'))
                return;
            settings = { ...defaults };
            cssState = cssDefaults();
            save();
            saveCSS();
            applyCSS();
            dialog.remove();
            buildDialog();
            apply();
            dialog.hidden = false;
            root.classList.add('st-customize-mode');
        };
        const done = make('button', '', 'BACK TO Spot64');
        done.onclick = () => closeCustomize();
        bottom.append(reset, done);
        contentBody.append(bottom);
        root.querySelector('.tm-main').append(dialog);
        customizeNavObserver?.disconnect();
        customizeNavObserver = new MutationObserver(() => refreshCustomizeNavigation());
        customizeNavObserver.observe(contentBody, { childList: true, subtree: true });
        refreshCustomizeNavigation();
    }
    function installArtworkClickAway() {
        const artwork = root?.querySelector('.tm-artwork');
        if (!artwork || artwork.dataset.spot64ClickAway === '1')
            return;
        artwork.dataset.spot64ClickAway = '1';
        artwork.addEventListener('click', event => {
            if (!root.classList.contains('tm-art-mode'))
                return;
            const canvas = artwork.querySelector('.tm-original-ascii-host canvas');
            if (!canvas)
                return;
            const x = event.clientX, y = event.clientY;
            const inside = r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
            const imageRect = canvas.getBoundingClientRect();
            if (inside(imageRect))
                return;
            const artRect = artwork.getBoundingClientRect();
            const safeWidth = Math.min(520, Math.max(0, artRect.width - 32));
            const left = artRect.left + (artRect.width - safeWidth) / 2;
            const top = imageRect.bottom + 8;
            if (x >= left && x <= left + safeWidth && y >= top && y <= top + 112)
                return;
            root.querySelector('.tm-art-toggle')?.click();
        });
    }
    function initialize() {
        const current = $('#tm-root');
        if (!current)
            return false;
        if (root === current && openButton?.isConnected)
            return true;
        root = current;
        const top = root.querySelector('.tm-top');
        if (!top)
            return false;
        openButton = make('button', '', 'CUSTOMIZE');
        openButton.id = 'spot64-customize-open';
        openButton.type = 'button';
        openButton.title = 'Customize Spot64 appearance';
        top.append(openButton);
        if (dialog)
            dialog.remove();
        buildDialog();
        openButton.addEventListener('click', openCustomize);
        document.addEventListener('click', event => { if (event.target.closest('#spot64-themes-open'))
            closeCustomize(false); }, true);
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog && !dialog.hidden)
            closeCustomize(); });
        buildFocusToggle();
        buildFooterVolume();
        const modeObserver = new MutationObserver(() => {
            if (root?.classList.contains('st-themes-mode') && root?.classList.contains('st-customize-mode'))
                closeCustomize(false);
        });
        modeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
        installArtworkClickAway();
        seek = root.querySelector('.tm-seek');
        if (seek) {
            seek.addEventListener('input', () => drawSeek(true));
            const player = window.Spicetify?.Player;
            if (player?.addEventListener)
                player.addEventListener('onprogress', drawSeek);
            const redraw = () => { if (seekCharacters)
                drawSeek(true); };
            window.addEventListener('resize', redraw);
            setInterval(() => { if (seekCharacters && seekCharacters.isConnected)
                drawSeek(); }, 60);
        }
        apply();
        return true;
    }
    if (!initialize()) {
        const timer = setInterval(() => { if (initialize())
            clearInterval(timer); }, 250);
    }
})();
