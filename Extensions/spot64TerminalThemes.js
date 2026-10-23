(() => {
    'use strict';
    const SETTINGS_KEY = 'spot64.customize.v1';
    const THEMES_KEY = 'spot64.themes.v1';
    const CSS_KEY = 'spot64.custom.css.v1';
    const builtins = [
        { id: 'spot64', name: 'Spot64', description: 'A simple terminal-inspired UI.', bg: '#101112', panel: '#18191b', line: '#666969', text: '#e8e6e3', accent: '#95b9b2', muted: '#969e9b', selection: '#2b3131' },
        { id: 'amber', name: 'Catppuccin', description: 'A standard Catppuccin theme.', bg: '#292c3c', panel: '#303446', line: '#626880', text: '#c6d0f5', accent: '#ca9ee6', muted: '#a5adce', selection: '#414559' },
        { id: 'spotify', name: 'Spotify', description: 'Inspired by Spotify\'s sleek dark interface.', bg: '#121212', panel: '#181818', line: '#181818', text: '#ffffff', accent: '#1ed760', muted: '#b3b3b3', selection: '#282828' },
        { id: 'phosphor', name: 'Access Granted', description: 'A retro phosphor-green sci-fi terminal.', bg: '#010603', panel: '#041009', line: '#67cb72', text: '#bcf7ae', accent: '#7df17e', muted: '#7bbd82', selection: '#12311a' },
        { id: 'violet', name: 'Discord', description: 'Inspired by Discord\'s charcoal and blurple styling.', bg: '#232428', panel: '#2b2d31', line: '#32343a', text: '#f2f3f5', accent: '#949cf7', muted: '#949ba4', selection: '#404249' },
        { id: 'mono', name: 'Twitch', description: 'Inspired by Twitch\'s dark UI and purple accents.', bg: '#0e0e10', panel: '#1f1f23', line: '#26262c', text: '#efeff1', accent: '#bf94ff', muted: '#adadb8', selection: '#323239' }
    ];
    const $ = (s, node = document) => node.querySelector(s);
    const make = (tag, cls, text) => {
        const n = document.createElement(tag);
        if (cls)
            n.className = cls;
        if (text !== undefined)
            n.textContent = text;
        return n;
    };
    const style = make('style');
    style.id = 'spot64-terminal-themes-style';
    style.textContent = `
    #tm-root .tm-side > .st-terminal{flex:0 0 auto;min-width:0;padding:0;margin:0;}


    #tm-root > .st-quick-row{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) 200px;gap:6px;flex:0 0 auto;min-width:0;padding:0 4px 7px;align-items:stretch;}
    #tm-root > .st-quick-row .st-quick-cell{position:relative;box-sizing:border-box;min-width:0;}
    #tm-root > .st-quick-row .tm-search-form,
    #tm-root > .st-quick-row .st-terminal,
    #tm-root > .st-quick-row .st-terminal-form{display:block!important;margin:0!important;padding:0!important;width:100%!important;min-width:0!important;border:0!important;background:transparent!important;}
    #tm-root > .st-quick-row .tm-search-input,
    #tm-root > .st-quick-row .st-terminal-input{box-sizing:border-box!important;width:100%!important;height:38px!important;min-height:38px!important;margin:0!important;padding:9px 10px!important;background:#202329!important;border:1px solid #474c55!important;border-radius:3px!important;color:inherit!important;font:inherit!important;font-size:12px!important;}
    #tm-root > .st-quick-row .tm-search-button{display:none!important;}
    #tm-root > .st-quick-row .st-terminal-output:not(:empty){position:absolute;right:0;top:100%;z-index:50;width:max-content;min-width:200px;max-width:min(460px,75vw);max-height:160px;overflow:auto;margin:4px 0 0!important;padding:9px!important;border:1px solid #474c55;background:#16191f;color:inherit;box-shadow:0 6px 14px #0008;}
    #tm-root > .tm-main{min-height:0;flex:1 1 auto;}
    #tm-root.st-themes-mode > .st-quick-row,
    #tm-root.tm-art-mode > .st-quick-row{display:none!important;}
    @media(max-width:680px){#tm-root > .st-quick-row{grid-template-columns:minmax(0,1fr) 120px;}}

    #tm-root .tm-side > .tm-playlists{flex:1 1 0;min-height:64px;overflow:hidden;}
    #tm-root .tm-side > .tm-playlists .tm-list{min-height:0;overflow-y:auto;}
    #tm-root .tm-side > .tm-ascii{flex-shrink:0;}
    #tm-root .st-terminal-label{font-size:11px;opacity:.7;margin-bottom:5px;}
    #tm-root .st-terminal-form{display:block;min-width:0;}
    #tm-root .st-terminal-input{box-sizing:border-box;display:block;width:100%;min-width:0;color:inherit;background:#202329;border:1px solid #474c55;border-radius:4px;outline:none;font:inherit;font-size:12px;padding:9px 12px;}
    #tm-root .st-terminal-input:focus{border-color:#79808d;}
    #tm-root .st-terminal-input::placeholder{color:#a4aabb;opacity:1;}
    #tm-root .st-terminal-output:empty{display:none;}
    #tm-root .st-terminal-output{font-size:11px;line-height:1.45;font-family:inherit;white-space:pre-wrap;overflow-wrap:anywhere;opacity:.75;max-height:67px;overflow:auto;margin:5px 0 0;}
    #tm-root .st-terminal-run{font:inherit;color:inherit;border:1px solid #626873;background:transparent;padding:3px 5px;cursor:pointer;}
    #tm-root.st-themes-mode .tm-main > .tm-side,
    #tm-root.st-themes-mode .tm-main > .tm-browser,
    #tm-root.st-themes-mode .tm-main > .tm-artwork{display:none!important;}
    #tm-root .tm-main > #spot64-themes-screen{display:none!important;}
    #tm-root.st-themes-mode .tm-main > #spot64-themes-screen{display:flex!important;}
    #tm-root.st-themes-mode .tm-main{display:flex!important;min-height:0;}
    #spot64-themes-screen{box-sizing:border-box;flex:1;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:#0b0e12;color:#e9edf2;font:12px Consolas,monospace;padding:16px 20px;}
    #spot64-themes-screen *{box-sizing:border-box;}
    #spot64-themes-screen .st-gallery-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:13px;border-bottom:1px solid #444b55;}
    #spot64-themes-screen .st-gallery-title{font-size:15px;font-weight:bold;letter-spacing:1px;}
    #spot64-themes-screen .st-gallery-body{overflow:auto;min-height:0;flex:1;padding:16px 2px;}
    #spot64-themes-screen button{font:inherit;cursor:pointer;color:inherit;background:#20252b;border:1px solid #57606c;padding:8px 12px;}
    #spot64-themes-screen button:hover{background:#343b43;}
    #spot64-themes-screen input{font:inherit;color:inherit;background:#20252b;border:1px solid #57606c;padding:9px 12px;min-width:100px;flex:1;}
    #spot64-themes-screen .st-save-row{display:flex;gap:10px;align-items:center;margin:0 0 16px;flex-wrap:wrap;}
    #spot64-themes-screen .st-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:15px;align-content:start;}
    #spot64-themes-screen .st-gallery-card{background:#15191e;border:1px solid #424851;padding:12px;min-width:0;}
    #spot64-themes-screen .st-gallery-image{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border:1px solid #414751;background:#0b0e12;}
    #spot64-themes-screen .st-gallery-name{font-size:14px;font-weight:bold;overflow-wrap:anywhere;margin-top:12px;}
    #spot64-themes-screen .st-gallery-palette{display:flex;gap:4px;margin:9px 0 5px;}
    #spot64-themes-screen .st-gallery-palette span{flex:1;min-width:0;height:19px;border:1px solid #ffffff2a;}
    #spot64-themes-screen .st-gallery-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;}
    #spot64-themes-screen .st-muted{color:#a6afb9;font-size:11px;line-height:1.5;}
    #spot64-themes-screen .st-status{margin:0 0 12px;min-height:16px;color:#becfe0;}
    #spot64-themes-screen .st-gallery-kind{font-size:10px;color:#a6afb9;margin-top:4px;}
    #spot64-themes-screen .st-builtin-desc{font-size:11px;color:var(--spot64-ui-muted,#a6afb9);line-height:1.5;margin-top:5px;}
    #spot64-themes-screen .st-builtin-grid{margin:8px 0 28px;}
    #spot64-themes-screen .st-saved-label{border-top:1px solid var(--spot64-ui-border,#4a4e55);padding-top:15px;margin-top:4px;}
    #spot64-themes-screen .st-builtin-card .st-gallery-image{background:#090b0f;}


    #spot64-themes-screen {
      position:relative!important;
      overflow:visible!important;
      margin-top:10px!important;
      padding:28px 16px 16px!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
      background:var(--spot64-ui-panel,#1a1c22)!important;
      color:var(--spot64-ui-text,#eee)!important;
      font-family:var(--spot64-ui-font,Consolas,monospace)!important;
      font-size:var(--spot64-ui-size,12px)!important;
    }
    :root[data-spot64-menu-gradient="true"] #spot64-themes-screen {
      border-color:transparent!important;border-style:solid!important;
      background-image:linear-gradient(var(--spot64-ui-panel,#1a1c22),var(--spot64-ui-panel,#1a1c22)),var(--spot64-ui-gradient)!important;
      background-origin:padding-box,border-box!important;
      background-clip:padding-box,border-box!important;
    }
    #spot64-themes-screen .st-gallery-header {
      position:absolute!important;top:0;left:14px;right:14px;
      transform:translateY(-50%);z-index:4;
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      padding:0!important;margin:0!important;border:0!important;
      pointer-events:none;
    }
    #spot64-themes-screen .st-gallery-title {
      padding:0 7px!important;
      background:var(--spot64-ui-panel,#1a1c22)!important;
      color:var(--spot64-ui-heading,#eee)!important;
      font:700 var(--spot64-ui-heading-size,12px)/1.3 var(--spot64-ui-font,Consolas,monospace)!important;
      letter-spacing:0;
    }
    #spot64-themes-screen .st-gallery-header button{
      pointer-events:auto;
      padding:2px 7px!important;
      background:var(--spot64-ui-panel,#1a1c22)!important;
    }
    #spot64-themes-screen button,#spot64-themes-screen input {
      color:var(--spot64-ui-button,var(--spot64-ui-text,#eee))!important;
      background:var(--spot64-ui-field,#23272e)!important;
      border:1px solid var(--spot64-ui-border,#696c74)!important;
      border-radius:3px;font:inherit!important;
    }
    #spot64-themes-screen button:hover {background:var(--spot64-ui-highlight,#30343d)!important;}
    #spot64-themes-screen .st-gallery-card {
      background:var(--spot64-ui-panel,#1a1c22)!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
      color:var(--spot64-ui-text,#eee)!important;
    }
    #spot64-themes-screen .st-gallery-image {border-color:var(--spot64-ui-border,#696c74)!important;}
    #spot64-themes-screen .st-gallery-name {font-size:1.1em!important;color:var(--spot64-ui-heading,#eee)!important;}
    #spot64-themes-screen .st-gallery-kind,#spot64-themes-screen .st-muted {color:var(--spot64-ui-muted,#aaaeb9)!important;font-size:.9em!important;}
    #spot64-themes-screen .st-status {color:var(--spot64-ui-text,#eee)!important;}
    #spot64-themes-screen .st-gallery-palette span {border-color:var(--spot64-ui-border,#696c74)!important;}


    #tm-root > .st-quick-row .tm-search-input,
    #tm-root > .st-quick-row .st-terminal-input {
      background:var(--spot64-ui-panel,#1a1c22)!important;
      color:var(--spot64-ui-text,#eee)!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
      font-family:var(--spot64-ui-font,Consolas,monospace)!important;
      font-size:var(--spot64-ui-size,12px)!important;
    }
    #tm-root > .st-quick-row .tm-search-input::placeholder,
    #tm-root > .st-quick-row .st-terminal-input::placeholder {color:var(--spot64-ui-muted,#aaaeb9)!important;}
    #tm-root > .st-quick-row .tm-search-input:focus,
    #tm-root > .st-quick-row .st-terminal-input:focus {outline:0!important;border-color:var(--spot64-ui-heading,#eee)!important;}
    #tm-root > .st-quick-row .st-terminal-output:not(:empty) {
      background:var(--spot64-ui-panel,#1a1c22)!important;
      color:var(--spot64-ui-text,#eee)!important;
      border:var(--spot64-ui-border-width,1px) var(--spot64-ui-border-style,solid) var(--spot64-ui-border,#696c74)!important;
      border-radius:var(--spot64-ui-radius,8px)!important;
      font-family:var(--spot64-ui-font,Consolas,monospace)!important;
      font-size:var(--spot64-ui-size,12px)!important;
      opacity:1!important;
    }
    :root[data-spot64-menu-gradient="true"] #tm-root > .st-quick-row .tm-search-input,
    :root[data-spot64-menu-gradient="true"] #tm-root > .st-quick-row .st-terminal-input,
    :root[data-spot64-menu-gradient="true"] #tm-root > .st-quick-row .st-terminal-output:not(:empty) {
      border-color:transparent!important;border-style:solid!important;
      background-image:linear-gradient(var(--spot64-ui-panel,#1a1c22),var(--spot64-ui-panel,#1a1c22)),var(--spot64-ui-gradient)!important;
      background-origin:padding-box,border-box!important;background-clip:padding-box,border-box!important;
    }

  `;
    document.head.append(style);
    let terminal, input, output, dialog, themeList, builtinList, themeName, themeStatus, openButton;
    let returnToArt = false;
    const COLOUR_KEYS = [
        ['mainBg', 'Background', '#0b0e12'], ['panelBg', 'Panels', '#171b21'],
        ['text', 'Text', '#eeeeee'], ['heading', 'Titles', '#eeeeee'],
        ['highlight', 'Highlight', '#424b59'], ['borderColor', 'Borders', '#525760'],
        ['button', 'Buttons', '#eeeeee'], ['progress', 'Progress', '#eeeeee'],
        ['visualizer', 'Visualizer', '#eeeeee']
    ];
    function isHex(value) { return /^#[0-9a-f]{6}$/i.test(String(value || '')); }
    const themes = () => {
        try {
            const val = JSON.parse(localStorage.getItem(THEMES_KEY) || '{}');
            return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
        }
        catch (_) {
            return {};
        }
    };
    const storedSettings = () => {
        try {
            const obj = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
            return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
        }
        catch (_) {
            return {};
        }
    };
    function persistThemes(obj) { localStorage.setItem(THEMES_KEY, JSON.stringify(obj)); }
    function setStatus(message) { if (themeStatus)
        themeStatus.textContent = message; }
    const unpack = item => item && typeof item === 'object' && item.settings && typeof item.settings === 'object' ? item.settings : item;
    function paletteOf(settings) {
        return COLOUR_KEYS.map(([key, label, fallback]) => ({
            key, label, color: isHex(settings?.[key]) ? settings[key] : fallback
        }));
    }
    function makePreview(settings) {
        const c = document.createElement('canvas');
        c.width = 800;
        c.height = 450;
        const ctx = c.getContext('2d');
        const get = (key, fallback) => isHex(settings?.[key]) ? settings[key] : fallback;
        const bg = get('mainBg', '#0b0e12'), panel = get('panelBg', '#171b21');
        const text = get('text', '#eeeeee'), title = get('heading', text);
        const border = get('borderColor', '#535963'), highlight = get('highlight', '#333d49');
        const vis = get('visualizer', text), progress = get('progress', text);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 800, 450);
        ctx.font = 'bold 17px monospace';
        ctx.fillStyle = title;
        ctx.fillText('spot64', 22, 33);
        function box(x, y, w, h, heading) {
            ctx.fillStyle = panel;
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = border;
            ctx.lineWidth = Number(settings?.borderSize) || 1;
            ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
            ctx.fillStyle = title;
            ctx.font = 'bold 12px monospace';
            ctx.fillText(heading, x + 14, y + 23);
        }
        box(15, 50, 245, 133, settings?.libraryTitle || 'LIBRARY');
        box(15, 190, 245, 138, settings?.playlistsTitle || 'PLAYLISTS');
        box(15, 335, 245, 70, 'VISUALIZER');
        box(271, 50, 514, 355, settings?.musicTitle || 'YOUR MUSIC');
        ctx.fillStyle = text;
        ctx.font = '12px monospace';
        ['Liked Songs', 'Recently Played', 'Top Tracks'].forEach((label, i) => ctx.fillText(label, 29, 102 + i * 21));
        ['Playlist 01', 'Playlist 02', 'Playlist 03'].forEach((label, i) => ctx.fillText(label, 29, 246 + i * 22));
        ctx.fillStyle = highlight;
        ctx.fillRect(285, 100, 480, 32);
        ctx.fillStyle = text;
        ctx.font = '12px monospace';
        ['Song title — Artist', 'Another track — Artist', 'Your music collection', 'Search results'].forEach((s, i) => ctx.fillText(s, 298, 121 + i * 41));
        ctx.fillStyle = vis;
        for (let i = 0; i < 30; i++)
            ctx.fillRect(29 + i * 7, 385 - (i * 7 % 29), 4, 6 + (i * 7 % 29));
        ctx.fillStyle = progress;
        ctx.fillRect(15, 417, 450, 4);
        ctx.fillStyle = border;
        ctx.fillRect(465, 417, 320, 4);
        ctx.fillStyle = text;
        ctx.fillText('♫  Previous     ▶     Next', 295, 443);
        return c.toDataURL('image/jpeg', 0.78);
    }
    async function captureWindowFrame() {
        if (typeof navigator.mediaDevices?.getDisplayMedia !== 'function')
            return null;
        let stream = null, video = null;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 1 }, audio: false });
            video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            await video.play();
            if (!video.videoWidth)
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Capture not available')), 3500);
                    video.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
                });
            const c = document.createElement('canvas');
            c.width = 960;
            c.height = 540;
            const ctx = c.getContext('2d');
            const iw = video.videoWidth, ih = video.videoHeight;
            if (!iw || !ih)
                throw new Error('No capture frame');
            ctx.fillStyle = '#0b0e12';
            ctx.fillRect(0, 0, c.width, c.height);
            const scale = Math.min(c.width / iw, c.height / ih);
            const dw = iw * scale, dh = ih * scale;
            ctx.drawImage(video, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
            return c.toDataURL('image/jpeg', 0.68);
        }
        catch (error) {
            console.info('[Spot64 Themes] Screen capture unavailable; using layout preview.', error);
            return null;
        }
        finally {
            if (stream)
                for (const track of stream.getTracks())
                    track.stop();
            if (video) {
                video.pause();
                video.srcObject = null;
            }
        }
    }
    function currentCSS() {
        try {
            const state = JSON.parse(localStorage.getItem(CSS_KEY) || '{}');
            return state && typeof state === 'object' && !Array.isArray(state) ? state : { preset: '', files: [] };
        }
        catch (_) {
            return { preset: '', files: [] };
        }
    }
    function renderBuiltins() {
        if (!builtinList)
            return;
        builtinList.replaceChildren();
        const selected = currentCSS().preset || '';
        for (const preset of builtins) {
            const card = make('article', 'st-gallery-card st-builtin-card');
            const img = make('img', 'st-gallery-image');
            img.alt = 'Illustrative preview of ' + preset.name;
            img.src = makePreview({ mainBg: preset.bg, panelBg: preset.panel, text: preset.text, heading: preset.accent, borderColor: preset.line, highlight: preset.selection, visualizer: preset.accent, progress: preset.accent });
            card.append(img, make('div', 'st-gallery-name', preset.name));
            card.append(make('div', 'st-builtin-desc', preset.description));
            card.append(make('div', 'st-gallery-kind', preset.id === selected ? 'built-in theme · active' : 'built-in theme · illustrative preview'));
            const pal = make('div', 'st-gallery-palette');
            for (const color of [preset.bg, preset.panel, preset.line, preset.text, preset.accent, preset.muted, preset.selection]) {
                const chip = make('span');
                chip.style.backgroundColor = color;
                chip.title = color;
                pal.append(chip);
            }
            card.append(pal);
            const actions = make('div', 'st-gallery-actions');
            const load = make('button', '', preset.id === selected ? 'active · reload' : 'load theme');
            load.type = 'button';
            load.addEventListener('click', () => {
                if (!window.confirm(`Load "${preset.name}"? Your imported CSS files will be kept but disabled. Spotify will reload.`))
                    return;
                try {
                    const state = currentCSS();
                    state.preset = preset.id;
                    state.files = Array.isArray(state.files) ? state.files.map(f => ({ ...f, enabled: false })) : [];
                    localStorage.setItem(CSS_KEY, JSON.stringify(state));
                    location.reload();
                }
                catch (error) {
                    setStatus('Unable to load built-in theme: ' + String(error.message || error));
                }
            });
            actions.append(load);
            card.append(actions);
            builtinList.append(card);
        }
    }
    function renderThemes() {
        if (!themeList)
            return;
        renderBuiltins();
        themeList.replaceChildren();
        const items = Object.entries(themes()).sort((a, b) => a[0].localeCompare(b[0]));
        if (!items.length) {
            themeList.append(make('p', 'st-muted', 'No saved themes yet. Add your current theme above.'));
            return;
        }
        for (const [name, item] of items) {
            const settings = unpack(item);
            if (!settings || typeof settings !== 'object')
                continue;
            const card = make('article', 'st-gallery-card');
            const img = make('img', 'st-gallery-image');
            img.alt = 'Preview of ' + name;
            img.src = (item?.preview && /^data:image\/(png|jpeg|webp);base64,/.test(item.preview)) ? item.preview : makePreview(settings);
            card.append(img, make('div', 'st-gallery-name', name));
            const kind = item?.previewType === 'screenshot' ? 'window screenshot' : item?.preview ? 'generated layout preview' : 'legacy theme · generated preview';
            card.append(make('div', 'st-gallery-kind', kind));
            const palette = make('div', 'st-gallery-palette');
            const swatches = Array.isArray(item?.palette) && item.palette.length ? item.palette : paletteOf(settings);
            for (const swatch of swatches) {
                if (!isHex(swatch.color))
                    continue;
                const chip = make('span');
                chip.style.backgroundColor = swatch.color;
                chip.title = (swatch.label || 'Colour') + ' ' + swatch.color;
                palette.append(chip);
            }
            card.append(palette);
            const actions = make('div', 'st-gallery-actions');
            const load = make('button', '', 'load theme');
            load.type = 'button';
            load.onclick = () => {
                if (!window.confirm(`Load theme "${name}"? Your current settings will be replaced. Spotify will reload.`))
                    return;
                try {
                    const snapshot = item && Object.prototype.hasOwnProperty.call(item, 'cssState') ? item.cssState : { preset: '', files: [] };
                    const previousSettings = localStorage.getItem(SETTINGS_KEY);
                    const previousCSS = localStorage.getItem(CSS_KEY);
                    try {
                        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                        localStorage.setItem(CSS_KEY, JSON.stringify(snapshot));
                    }
                    catch (err) {
                        if (previousSettings === null)
                            localStorage.removeItem(SETTINGS_KEY);
                        else
                            localStorage.setItem(SETTINGS_KEY, previousSettings);
                        if (previousCSS === null)
                            localStorage.removeItem(CSS_KEY);
                        else
                            localStorage.setItem(CSS_KEY, previousCSS);
                        throw err;
                    }
                    location.reload();
                }
                catch (error) {
                    setStatus('Unable to load theme: ' + String(error.message || error));
                }
            };
            const del = make('button', '', 'delete');
            del.type = 'button';
            del.onclick = () => {
                if (!window.confirm(`Delete theme "${name}"?`))
                    return;
                try {
                    const all = themes();
                    delete all[name];
                    persistThemes(all);
                    renderThemes();
                    setStatus(`Deleted "${name}".`);
                }
                catch (error) {
                    setStatus('Unable to delete theme: ' + String(error.message || error));
                }
            };
            actions.append(load, del);
            card.append(actions);
            themeList.append(card);
        }
    }
    async function saveTheme(options = {}) {
        const name = (options.name || themeName.value).trim();
        if (!name) {
            setStatus('Enter a theme name.');
            return;
        }
        if (name.length > 60) {
            setStatus('Theme names must be 60 characters or fewer.');
            return;
        }
        const existing = themes();
        if (Object.prototype.hasOwnProperty.call(existing, name) && !window.confirm(`Replace theme "${name}"?`))
            return;
        const settings = storedSettings();
        let preview = null;
        if (options.capture) {
            closeThemes();
            try {
                preview = await captureWindowFrame();
            }
            finally {
                openThemes();
            }
        }
        const entry = { settings: JSON.parse(JSON.stringify(settings)), palette: paletteOf(settings),
            cssState: JSON.parse(JSON.stringify(currentCSS())),
            preview: preview || makePreview(settings), previewType: preview ? 'screenshot' : 'generated' };
        try {
            const all = themes();
            all[name] = entry;
            persistThemes(all);
            themeName.value = '';
            renderThemes();
            setStatus(`Saved "${name}" with ${preview ? 'window screenshot' : 'generated layout preview'} and colour palette.`);
        }
        catch (error) {
            setStatus('Save failed (possibly storage full): ' + String(error.message || error));
        }
    }
    function closeThemes() {
        if (!dialog)
            return;
        dialog.closest('#tm-root')?.classList.remove('st-themes-mode');
        dialog.hidden = true;
        if (returnToArt) {
            returnToArt = false;
            const toggle = $('#tm-root .tm-art-toggle');
            if (toggle)
                toggle.click();
        }
    }
    function openThemes() {
        if (!dialog)
            return;
        const root = $('#tm-root');
        if (!root)
            return;
        if (!root.classList.contains('st-themes-mode')) {
            returnToArt = root.classList.contains('tm-art-mode');
            if (returnToArt) {
                const toggle = $('.tm-art-toggle', root);
                if (toggle)
                    toggle.click();
            }
        }
        dialog.hidden = false;
        root.classList.add('st-themes-mode');
        renderThemes();
    }
    function buildThemes() {
        const root = $('#tm-root'), main = $('.tm-main', root);
        if (!main)
            return;
        dialog = make('section');
        dialog.id = 'spot64-themes-screen';
        dialog.hidden = true;
        dialog.setAttribute('aria-label', 'Spot64 themes gallery');
        const head = make('div', 'st-gallery-header');
        head.append(make('div', 'st-gallery-title', 'spot64 / themes'));
        const close = make('button', '', 'back to spot64');
        close.type = 'button';
        close.onclick = () => { closeThemes(); openButton?.focus(); };
        head.append(close);
        dialog.append(head);
        const body = make('div', 'st-gallery-body');
        body.append(make('p', 'st-muted', 'Choose a built-in look or save your own. Saved themes preserve Customize settings plus your imported CSS layers.'));
        const row = make('div', 'st-save-row');
        themeName = make('input');
        themeName.placeholder = 'theme name';
        themeName.maxLength = 60;
        themeName.setAttribute('aria-label', 'theme name');
        themeName.addEventListener('keydown', event => { if (event.key === 'Enter') {
            event.preventDefault();
            saveTheme({ capture: true });
        } });
        const save = make('button', '', '+ add current theme');
        save.type = 'button';
        save.onclick = () => saveTheme({ capture: true });
        row.append(themeName, save);
        body.append(row);
        body.append(make('div', 'st-status', ''));
        themeStatus = body.lastChild;
        themeStatus.setAttribute('role', 'status');
        body.append(make('p', 'st-muted', 'preinstalled themes'));
        builtinList = make('div', 'st-gallery-grid st-builtin-grid');
        body.append(builtinList);
        body.append(make('p', 'st-muted st-saved-label', 'your saved themes'));
        themeList = make('div', 'st-gallery-grid');
        body.append(themeList);
        dialog.append(body);
        main.append(dialog);
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.hidden)
            closeThemes(); });
    }
    const message = text => { output.textContent = text; };
    function executeCommand(raw) {
        const value = raw.trim();
        if (!value)
            return;
        const [cmd, ...args] = value.split(/\s+/);
        const verb = cmd.toLowerCase();
        const rest = args.join(' ');
        const player = window.Spicetify?.Player;
        try {
            switch (verb) {
                case 'help':
                    message('help | play | pause | stop | next | previous\ncontrols on/off/toggle | search <song>\ncustomize | themes | themes save <name> | clear');
                    break;
                case 'play':
                    if (!player)
                        throw new Error('Player unavailable');
                    if (!player.isPlaying?.())
                        player.togglePlay();
                    message('Playback started.');
                    break;
                case 'pause':
                case 'stop':
                    if (!player)
                        throw new Error('Player unavailable');
                    if (player.isPlaying?.())
                        player.togglePlay();
                    message('Playback paused.');
                    break;
                case 'next':
                    player?.next?.();
                    message('Next track.');
                    break;
                case 'previous':
                case 'prev':
                    player?.back?.();
                    message('Previous track.');
                    break;
                case 'controls': {
                    const actions = $('#tm-root .tm-actions');
                    if (!actions)
                        throw new Error('Player buttons not found');
                    const op = (args[0] || '').toLowerCase();
                    if (!['on', 'off', 'toggle'].includes(op)) {
                        message('Usage: controls on | off | toggle');
                        break;
                    }
                    const currentlyVisible = actions.style.display !== 'none';
                    const show = op === 'on' || (op === 'toggle' && !currentlyVisible);
                    actions.style.display = show ? '' : 'none';
                    message('Playback buttons ' + (show ? 'shown.' : 'hidden.'));
                    break;
                }
                case 'search': {
                    if (!rest) {
                        message('Usage: search <song name>');
                        break;
                    }
                    const form = $('#tm-root .tm-search-form');
                    const box = $('#tm-root .tm-search-input');
                    if (!form || !box)
                        throw new Error('Search controls unavailable');
                    box.value = rest;
                    if (typeof form.requestSubmit === 'function')
                        form.requestSubmit();
                    else
                        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    message('Searching Spotify for: ' + rest);
                    break;
                }
                case 'customize': {
                    const b = $('#spot64-customize-open');
                    if (!b)
                        throw new Error('Customize extension not found');
                    const d = $('#spot64-customize-dialog');
                    if (d?.hidden === false) {
                        message('Customize menu is already open.');
                        break;
                    }
                    b.click();
                    message('Customize menu opened.');
                    break;
                }
                case 'themes': {
                    if ((args[0] || '').toLowerCase() === 'save') {
                        const name = args.slice(1).join(' ').trim();
                        if (!name) {
                            message('Usage: themes save <name>');
                            break;
                        }
                        themeName.value = name;
                        saveTheme({ name, capture: false }).then(() => message(themeStatus.textContent));
                    }
                    else if (!args.length) {
                        openThemes();
                        message('Themes window opened.');
                    }
                    else
                        message('Usage: themes | themes save <name>');
                    break;
                }
                case 'clear':
                    message('');
                    break;
                default: message('Unknown command. Type help for commands.');
            }
        }
        catch (e) {
            message('ERROR: ' + String(e?.message || e));
            console.warn('[Spot64]', e);
        }
    }
    function initialize() {
        const root = $('#tm-root');
        if (!root)
            return false;
        const side = $('.tm-side', root), header = $('.tm-top', root);
        if (!side || !header)
            return false;
        if ($('#spot64-terminal-shell'))
            return true;
        terminal = make('div', 'st-terminal');
        terminal.id = 'spot64-terminal-shell';
        const form = make('form', 'st-terminal-form');
        input = make('input', 'st-terminal-input');
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.placeholder = 'help';
        input.setAttribute('aria-label', 'Spot64 terminal command');
        form.append(input);
        terminal.append(form);
        output = make('pre', 'st-terminal-output', '');
        output.setAttribute('aria-live', 'polite');
        terminal.append(output);
        form.addEventListener('submit', e => { e.preventDefault(); const command = input.value; input.value = ''; executeCommand(command); });
        document.addEventListener('pointerdown', event => {
            if (terminal?.isConnected && output?.textContent && !terminal.contains(event.target)) {
                output.textContent = '';
            }
        }, true);
        const main = $('.tm-main', root), searchForm = $('.tm-search-form', root);
        if (main && searchForm && !$('.st-quick-row', root)) {
            const quickRow = make('div', 'st-quick-row');
            const searchCell = make('div', 'st-quick-cell');
            const helpCell = make('div', 'st-quick-cell');
            searchCell.append(searchForm);
            helpCell.append(terminal);
            quickRow.append(searchCell, helpCell);
            root.insertBefore(quickRow, main);
        }
        else {
            side.append(terminal);
        }
        openButton = make('button', '', 'THEMES');
        openButton.id = 'spot64-themes-open';
        openButton.type = 'button';
        openButton.style.cssText = 'font:inherit;color:inherit;background:transparent;border:1px solid currentColor;padding:3px 9px;cursor:pointer;margin-left:7px;font-size:12px';
        header.append(openButton);
        buildThemes();
        openButton.onclick = openThemes;
        return true;
    }
    if (!initialize()) {
        const timer = setInterval(() => { if (initialize())
            clearInterval(timer); }, 250);
    }
})();
