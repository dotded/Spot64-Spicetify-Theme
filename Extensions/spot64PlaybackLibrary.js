(() => {
    'use strict';
    if (window.__spot64PlaybackLibraryLoaded)
        return;
    window.__spot64PlaybackLibraryLoaded = true;
    const S = window.Spicetify;
    const PREFIX = '[Spot64 playback]';
    const make = (tag, cls, content) => {
        const n = document.createElement(tag);
        if (cls)
            n.className = cls;
        if (content !== undefined)
            n.textContent = content;
        return n;
    };
    const css = make('style');
    css.textContent = `

    #tm-root .tm-shuffle-button,#tm-root .tm-repeat-button{
      font:inherit!important;cursor:pointer!important;padding:2px 7px!important;
      min-width:26px!important;text-decoration:none!important;
       display:inline-flex!important;align-items:center!important;justify-content:center!important;
    }
    #tm-root .tm-shuffle-button svg,#tm-root .tm-repeat-button svg{
       width:19px;height:19px;display:block;flex:none;pointer-events:none;
    }

    #tm-root .tm-shuffle-button:disabled,#tm-root .tm-repeat-button:disabled{cursor:default!important;}


    #tm-root .tm-side .tm-playlists{
      display:flex!important;flex-direction:column!important;
      min-height:0!important;overflow:visible!important;
    }
    #tm-root .tm-side .tm-playlists > .tm-list{
      flex:1 1 50%!important;min-height:0!important;overflow-y:auto!important;
    }
    #tm-root .tm-playlists > .tm-queue-dock{
      position:relative!important;inset:auto!important;
      flex:1 1 50%!important;display:flex!important;flex-direction:column!important;
      min-height:0!important;box-sizing:border-box!important;
      background:transparent!important;color:inherit!important;overflow:visible!important;
      border:0!important;border-top:inherit!important;

      margin-left:calc(-1 * var(--tm-queue-pad-left,8px))!important;
      margin-right:calc(-1 * var(--tm-queue-pad-right,8px))!important;
      width:calc(100% + var(--tm-queue-pad-left,8px) + var(--tm-queue-pad-right,8px))!important;
    }
    #tm-root .tm-queue-dock.tm-queue-gradient{border-top-color:transparent!important;}
    #tm-root .tm-queue-dock.tm-queue-gradient::before{
      content:"";position:absolute;top:0;left:0;right:0;
      height:var(--tm-queue-divider-size,1px);
      background:linear-gradient(135deg,var(--tm-queue-color-a,#555),var(--tm-queue-color-b,#888));
      pointer-events:none;
    }

    #tm-root .tm-queue-top{
      flex:0 0 20px!important;height:20px!important;position:relative!important;
      padding:0!important;border:0!important;overflow:visible!important;
    }
    #tm-root .tm-queue-top > .tm-title{
      position:absolute!important;top:0!important;
      left:calc(var(--tm-queue-pad-left,8px) + 6px)!important;
      transform:translateY(-50%);z-index:3;
      margin:0!important;padding:0 6px!important;
      max-width:calc(100% - 30px);overflow:hidden;text-overflow:ellipsis;
      white-space:nowrap;line-height:1.2!important;
      background:var(--tm-heading-surface,var(--tm-panel,#1a1c22))!important;
    }
    #tm-root .tm-queue-list{
      flex:1 1 0;min-height:0;overflow-y:auto;contain:content;
      padding:0 var(--tm-queue-pad-right,8px) 8px var(--tm-queue-pad-left,8px);
    }
    #tm-root .tm-queue-entry{
      display:flex!important;flex-direction:row!important;align-items:center!important;
      gap:4px!important;min-width:0!important;
      margin:0!important;padding:0!important;border:0!important;
    }
    #tm-root .tm-queue-entry .tm-queue-play{
      display:block!important;flex:1 1 auto!important;min-width:0!important;
      width:auto!important;text-align:left!important;white-space:nowrap!important;
      overflow:hidden!important;text-overflow:ellipsis!important;
      cursor:pointer!important;text-decoration:none!important;
    }

    #tm-root .tm-queue-entry .tm-queue-remove{
      flex:0 0 auto;display:block;background:transparent;border:0;
      font:inherit;cursor:pointer;opacity:0;padding:3px 6px;
      color:inherit;
    }
    #tm-root .tm-queue-entry:hover .tm-queue-remove,
    #tm-root .tm-queue-entry:focus-within .tm-queue-remove{opacity:.75;}
    #tm-root .tm-queue-entry .tm-queue-remove:hover{opacity:1;}
    #tm-root .tm-feature-status{padding:11px 12px;font-size:12px;white-space:pre-wrap;}
    #tm-root .tm-recent-info{font-size:10px;opacity:.7;padding:6px 12px;}
  `;
    document.head.append(css);
    let root, playerRow, trackList, browser, side, queueDock, queueList, shuffleButton, repeatButton;
    let lastQueueKey = '', lastQueueRefresh = 0, currentView = null, historyRequest = 0;
    const safeText = value => typeof value === 'string' ? value : '';
    const trackName = track => safeText(track?.name || track?.metadata?.title || track?.track?.name || track?.track?.metadata?.title) || 'Unknown track';
    const artistName = track => {
        const list = track?.artists?.items || track?.artists || track?.track?.artists || track?.album?.artists;
        if (Array.isArray(list))
            return list.map(a => a?.name || a?.profile?.name || '').filter(Boolean).join(', ');
        return safeText(track?.metadata?.artist_name || track?.track?.metadata?.artist_name || track?.artist?.name || track?.artist_name || track?.artist);
    };
    const normalize = item => {
        const t = item?.contextTrack || item?.data || item?.track?.track || item?.track || item?.item?.track || item?.item || item;
        const uri = t?.uri || t?.metadata?.uri || item?.uri || item?.track?.uri;
        if (typeof uri !== 'string' || !uri.startsWith('spotify:track:'))
            return null;
        const duration = Number(t?.duration?.milliseconds || t?.duration_ms || t?.duration?.totalMilliseconds || t?.metadata?.duration || (typeof t?.duration === 'number' ? t.duration : 0));
        return { uri, uid: item?.uid || t?.uid, name: trackName(t), artist: artistName(t), album: safeText(t?.album?.name || t?.album?.data?.name || t?.albumOfTrack?.name || t?.metadata?.album_title || t?.album), duration };
    };
    const formatTime = ms => {
        const seconds = Math.max(0, Math.floor((ms || 0) / 1000));
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    function showStatus(message) {
        if (!trackList)
            return;
        trackList.replaceChildren(make('div', 'tm-feature-status', message));
    }
    function showTracks(label, items, note) {
        currentView = label;
        const title = browser.querySelector('.tm-browser-head .tm-title');
        const count = browser.querySelector('.tm-browser-head .tm-muted');
        if (title)
            title.textContent = label;
        if (count)
            count.textContent = `${items.length} tracks`;
        trackList.replaceChildren();
        if (note)
            trackList.append(make('div', 'tm-recent-info', note));
        if (!items.length) {
            showStatus('No tracks available.');
            return;
        }
        const fragment = document.createDocumentFragment();
        for (const item of items) {
            const track = normalize(item);
            if (!track)
                continue;
            const btn = make('button', 'tm-track');
            btn.type = 'button';
            btn.title = `${track.name} — ${track.artist}`;
            btn.append(make('span', '', track.name), make('span', 'tm-muted', track.artist || '—'), make('span', 'tm-muted', track.album || '—'), make('span', 'tm-muted', track.duration ? formatTime(track.duration) : '—'));
            btn.addEventListener('click', async () => {
                try {
                    await S.Player.playUri(track.uri);
                }
                catch (error) {
                    console.error(PREFIX, error);
                    S.showNotification?.('Unable to play track', true);
                }
            });
            fragment.append(btn);
        }
        trackList.append(fragment);
    }
    async function api(path) {
        const response = await S.CosmosAsync.get('https://api.spotify.com/v1/' + path);
        if (!response || response.error || !Array.isArray(response.items))
            throw new Error(response?.error?.message || 'Spotify did not return a tracks list.');
        return response.items;
    }
    function fromSessionHistory() {
        const previous = S.Player?.data?.previousItems || S.Queue?.prevTracks || S.Player?.data?.prev_tracks || [];
        return Array.isArray(previous) ? previous.map(normalize).filter(Boolean) : [];
    }
    async function recentPlayed() {
        const request = ++historyRequest;
        showStatus('Loading Recently Played…');
        try {
            let items;
            try {
                const history = S.Platform?.PlayHistoryAPI;
                if (typeof history?.getContents !== 'function')
                    throw new Error('Native history unavailable');
                const result = await history.getContents();
                if (!Array.isArray(result?.items))
                    throw new Error('Native history response is invalid');
                items = result.items;
            }
            catch (_) {
                items = await api('me/player/recently-played?limit=50');
            }
            if (request !== historyRequest)
                return;
            const normalized = items.map(normalize).filter(Boolean);
            showTracks('RECENTLY PLAYED', normalized, 'Spotify playback history');
        }
        catch (error) {
            if (request !== historyRequest)
                return;
            const recent = fromSessionHistory();
            if (recent.length)
                showTracks('RECENTLY PLAYED', recent, 'Session history only — Spotify account history is unavailable in this client.');
            else {
                showTracks('RECENTLY PLAYED', [], null);
                showStatus('Spotify playback history is unavailable in this client, and no session history is currently available.\n' + String(error?.message || error));
            }
        }
    }
    async function topTracks() {
        const request = ++historyRequest;
        showStatus('Loading your Top Tracks…');
        try {
            let tracks, note;
            try {
                const gql = S.GraphQL;
                if (typeof gql?.Request !== 'function')
                    throw new Error('Spotify profile query unavailable');
                const definition = gql.Definitions?.userTopContent || {
                    name: 'userTopContent', operation: 'query',
                    sha256Hash: '61b7353d3625780022dbc63d459eb64cd609e7e5e2a820f9160d65030efe2e15'
                };
                const result = await gql.Request(definition, {
                    includeTopArtists: false, topArtistsInput: { offset: 0, limit: 0, sortBy: 'AFFINITY', timeRange: 'SHORT_TERM' },
                    includeTopTracks: true, topTracksInput: { offset: 0, limit: 50, sortBy: 'AFFINITY', timeRange: 'SHORT_TERM' }
                });
                const page = result?.data?.me?.profile?.topTracks;
                if (!Array.isArray(page?.items))
                    throw new Error(result?.errors?.[0]?.message || 'Spotify profile returned no top tracks');
                tracks = page.items.map(item => item?.data).filter(item => item?.uri?.startsWith('spotify:track:'));
                note = 'Your Spotify profile top tracks · this month';
            }
            catch (_) {
                tracks = await api('me/top/tracks?limit=50&time_range=short_term');
                note = 'Your Spotify top tracks · recent listening';
            }
            if (request !== historyRequest)
                return;
            showTracks('TOP TRACKS', tracks, note);
        }
        catch (error) {
            if (request !== historyRequest)
                return;
            showTracks('TOP TRACKS', [], null);
            showStatus('Top Tracks requires Spotify account-history API access. This client did not provide it.\n' + String(error?.message || error));
        }
    }
    function queueItems() {
        const snapshots = [];
        for (const owner of [S.Player?.origin, S.Platform?.PlayerAPI,
            S.Platform?.PlayerAPI?._queue]) {
            try {
                const snapshot = owner?.getQueue?.();
                if (snapshot && typeof snapshot.then !== 'function')
                    snapshots.push(snapshot);
            }
            catch (error) {
                console.debug(PREFIX, 'Queue snapshot unavailable', error);
            }
        }
        let available = false;
        for (const snapshot of snapshots) {
            if (Array.isArray(snapshot.queued) && Array.isArray(snapshot.nextUp)) {
                return [...snapshot.queued, ...snapshot.nextUp];
            }
        }
        const prioritized = [S.Queue?.nextTracks, S.Player?.data?.nextItems,
            S.Player?.data?.next_tracks, ...snapshots.flatMap(q => [q.nextTracks, q.queue, q.queued])];
        for (const list of prioritized) {
            if (!Array.isArray(list))
                continue;
            available = true;
            if (list.some(item => normalize(item)))
                return list;
        }
        return available ? [] : null;
    }
    function updateDivider() {
        const panel = side?.querySelector('.tm-playlists');
        if (!panel || !queueDock)
            return;
        const cs = getComputedStyle(panel);
        queueDock.style.setProperty('--tm-queue-pad-left', cs.paddingLeft);
        queueDock.style.setProperty('--tm-queue-pad-right', cs.paddingRight);
        queueDock.style.borderTop = `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
        let settings = {};
        try {
            settings = JSON.parse(localStorage.getItem('spot64.customize.v1') || '{}');
        }
        catch (_) { }
        const gradient = !!(settings.borderGradient && /^#[\da-fA-F]{6}$/.test(settings.borderColor || '')
            && /^#[\da-fA-F]{6}$/.test(settings.borderColor2 || ''));
        queueDock.classList.toggle('tm-queue-gradient', gradient);
        if (gradient) {
            queueDock.style.setProperty('--tm-queue-divider-size', Math.max(1, parseFloat(cs.borderTopWidth) || 1) + 'px');
            queueDock.style.setProperty('--tm-queue-color-a', settings.borderColor);
            queueDock.style.setProperty('--tm-queue-color-b', settings.borderColor2);
        }
    }
    function updateQueue(force = false) {
        if (!queueDock || !queueList)
            return;
        const now = Date.now();
        if (!force && now - lastQueueRefresh < 1800)
            return;
        lastQueueRefresh = now;
        const entries = queueItems();
        if (entries === null) {
            queueList.replaceChildren(make('div', 'tm-feature-status', 'Queue information is unavailable from this Spotify client.'));
            return;
        }
        const normalized = entries.map(normalize).filter(Boolean);
        const key = JSON.stringify(normalized.map(item => [item.uri, item.uid, item.name, item.artist]));
        if (!force && key === lastQueueKey)
            return;
        lastQueueKey = key;
        queueList.replaceChildren();
        if (!normalized.length) {
            queueList.append(make('div', 'tm-feature-status', 'Your queue is empty.'));
            return;
        }
        const frag = document.createDocumentFragment();
        normalized.slice(0, 100).forEach((track, index) => {
            const uid = track.uid;
            const row = make('div', 'tm-queue-entry');
            const play = make('button', 'tm-item tm-queue-play', `${index + 1}. ${track.name} — ${track.artist || '—'}`);
            play.type = 'button';
            play.title = `Play ${track.name} — ${track.artist || 'Unknown artist'}`;
            play.addEventListener('click', async () => {
                try {
                    const origin = S.Player.origin || S.Platform?.PlayerAPI;
                    if (typeof origin?.skipTo === 'function') {
                        await origin.skipTo({ uri: track.uri, ...(uid ? { uid } : {}) });
                    }
                    else {
                        const context = S.Player.data?.context?.uri;
                        if (!context || typeof S.Player.playUri !== 'function')
                            throw new Error('Queue context unavailable');
                        await S.Player.playUri(context, {}, { skipTo: { uri: track.uri, ...(uid ? { uid } : {}) } });
                    }
                    updateQueue(true);
                }
                catch (error) {
                    console.warn(PREFIX, 'Queue track playback failed', error);
                    S.showNotification?.('Could not play queued track', true);
                }
            });
            row.append(play);
            if (uid && typeof S.Platform?.PlayerAPI?.removeFromQueue === 'function') {
                const remove = make('button', 'tm-queue-remove', '×');
                remove.type = 'button';
                remove.title = 'Remove this queued track';
                remove.setAttribute('aria-label', `Remove ${track.name} from queue`);
                remove.addEventListener('click', async () => {
                    try {
                        await S.Platform.PlayerAPI.removeFromQueue([{ uri: track.uri, uid }]);
                        lastQueueKey = '';
                        updateQueue(true);
                    }
                    catch (error) {
                        console.warn(PREFIX, 'Could not remove queue item', error);
                        S.showNotification?.('Could not remove queued track', true);
                    }
                });
                row.append(remove);
            }
            frag.append(row);
        });
        queueList.append(frag);
    }
    const hex = value => /^#[\da-fA-F]{6}$/.test(value || '') ? value : null;
    let lastThemeData = null, lastThemeColours = null, lastControlKey = '';
    function themeControlColours() {
        const data = localStorage.getItem('spot64.customize.v1') || '{}';
        if (data === lastThemeData && lastThemeColours)
            return lastThemeColours;
        let theme = {};
        try {
            theme = JSON.parse(data) || {};
        }
        catch (_) { }
        lastThemeData = data;
        lastThemeColours = {
            off: hex(theme.muted) || '#777d86',
            on: hex(theme.progress) || hex(theme.heading) || hex(theme.borderColor) || hex(theme.button) || '#98d8ff',
            one: hex(theme.borderColor2) || '#c59cff'
        };
        return lastThemeColours;
    }
    function playerIcon(kind) {
        const namespace = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(namespace, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '19');
        svg.setAttribute('height', '19');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        const paths = kind === 'shuffle'
            ? ['m18 14 4 4-4 4', 'm18 2 4 4-4 4', 'M2 18h2.5a6 6 0 0 0 5-3l5-9a6 6 0 0 1 5-3H22', 'M2 6h2.5a6 6 0 0 1 5 3l.7 1.2', 'M14 15.8l.5.9a6 6 0 0 0 5 3H22']
            : ['m17 2 4 4-4 4', 'M3 11V9a3 3 0 0 1 3-3h15', 'm7 22-4-4 4-4', 'M21 13v2a3 3 0 0 1-3 3H3'];
        for (const d of paths) {
            const path = document.createElementNS(namespace, 'path');
            path.setAttribute('d', d);
            svg.append(path);
        }
        return svg;
    }
    function refreshControls() {
        if (!shuffleButton || !repeatButton)
            return;
        const player = S.Player;
        const shuffle = Boolean(player?.getShuffle?.());
        const repeat = Number(player?.getRepeat?.() ?? 0);
        const colours = themeControlColours();
        const stateKey = `${shuffle}:${repeat}:${colours.off}:${colours.on}:${colours.one}`;
        if (stateKey === lastControlKey)
            return;
        lastControlKey = stateKey;
        shuffleButton.setAttribute('aria-pressed', String(shuffle));
        shuffleButton.title = `Shuffle ${shuffle ? 'on' : 'off'}`;
        shuffleButton.setAttribute('aria-label', shuffle ? 'Disable shuffle' : 'Enable shuffle');
        shuffleButton.style.setProperty('color', shuffle ? colours.on : colours.off, 'important');
        repeatButton.dataset.mode = String(repeat);
        repeatButton.title = ['Repeat off', 'Repeat all', 'Repeat one'][repeat] || 'Repeat';
        repeatButton.setAttribute('aria-label', `Repeat ${['off', 'all', 'one'][repeat] || 'mode'}. Change repeat mode`);
        if (!repeatButton.firstChild)
            repeatButton.append(playerIcon('repeat'));
        repeatButton.style.setProperty('color', repeat === 2 ? colours.one : repeat === 1 ? colours.on : colours.off, 'important');
    }
    let playbackSettingPending = false;
    async function changePlaybackSetting(which) {
        if (playbackSettingPending)
            return;
        const player = S.Player;
        const prop = which === 'shuffle' ? 'Shuffle' : 'Repeat';
        const getter = player?.['get' + prop];
        const origin = player?.origin || S.Platform?.PlayerAPI;
        const setter = origin?.['set' + prop];
        if (typeof getter !== 'function' || typeof setter !== 'function') {
            S.showNotification?.(`${prop} control unavailable in this Spotify client`, true);
            return;
        }
        const before = getter.call(player);
        const requested = which === 'shuffle' ? !Boolean(before) : (Number(before) + 1) % 3;
        playbackSettingPending = true;
        shuffleButton.disabled = true;
        repeatButton.disabled = true;
        try {
            const context = player.data?.context?.uri;
            const shuffleAPI = S.Platform?.ShuffleAPI;
            if (which === 'shuffle' && context && typeof shuffleAPI?.setShuffle === 'function') {
                await shuffleAPI.setShuffle(context, requested ? 1 : 0);
            }
            else {
                await setter.call(origin, requested);
            }
            for (const ms of [100, 200, 350, 500, 750, 1000, 1000]) {
                if (getter.call(player) === requested)
                    break;
                await new Promise(resolve => setTimeout(resolve, ms));
            }
            if (getter.call(player) !== requested) {
                console.warn(PREFIX, `${prop} did not reach requested state`, { before, requested, actual: getter.call(player) });
                S.showNotification?.(`${prop} did not update; Spotify may restrict this context`, true);
            }
        }
        catch (error) {
            console.warn(PREFIX, `${prop} change failed`, error);
            S.showNotification?.(`Could not change ${which}: ${error?.message || error}`, true);
        }
        finally {
            playbackSettingPending = false;
            shuffleButton.disabled = false;
            repeatButton.disabled = false;
            refreshControls();
            updateQueue(true);
        }
    }
    function mount() {
        root = document.getElementById('tm-root');
        if (!root || !S?.Player)
            return false;
        const actions = root.querySelector('.tm-player-row .tm-actions');
        playerRow = root.querySelector('.tm-player-row');
        browser = root.querySelector('.tm-browser');
        side = root.querySelector('.tm-side');
        trackList = root.querySelector('.tm-tracks');
        if (!actions || !playerRow || !browser || !side || !trackList || !side.querySelector('.tm-playlists'))
            return false;
        shuffleButton = make('button', 'tm-shuffle-button');
        shuffleButton.append(playerIcon('shuffle'));
        shuffleButton.type = 'button';
        shuffleButton.setAttribute('aria-label', 'Toggle shuffle');
        shuffleButton.addEventListener('click', () => changePlaybackSetting('shuffle'));
        repeatButton = make('button', 'tm-repeat-button');
        repeatButton.append(playerIcon('repeat'));
        repeatButton.type = 'button';
        repeatButton.setAttribute('aria-label', 'Cycle repeat mode');
        repeatButton.addEventListener('click', () => changePlaybackSetting('repeat'));
        actions.prepend(shuffleButton);
        actions.append(repeatButton);
        queueDock = make('section', 'tm-queue-dock');
        queueDock.setAttribute('aria-label', 'Upcoming tracks');
        const queueTop = make('div', 'tm-queue-top');
        queueTop.append(make('div', 'tm-title', 'QUEUE'));
        queueList = make('div', 'tm-queue-list');
        queueDock.append(queueTop, queueList);
        side.querySelector('.tm-playlists').append(queueDock);
        const entries = Array.from(side.querySelectorAll('.tm-library .tm-item'));
        root.addEventListener('click', event => {
            if (event.target.closest('.tm-playlists > .tm-list .tm-item,.tm-library .tm-item,.tm-search button')) {
                historyRequest++;
            }
        }, true);
        for (const entry of entries) {
            const text = entry.textContent.trim().toLowerCase();
            if (text === 'recently played' || text === 'top tracks') {
                entry.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    if (text === 'recently played')
                        recentPlayed();
                    else
                        topTracks();
                }, true);
            }
        }
        S.Player.addEventListener('songchange', () => { lastQueueKey = ''; updateQueue(true); refreshControls(); });
        S.Player.addEventListener('onupdate', refreshControls);
        S.Player.addEventListener('onplaypause', refreshControls);
        refreshControls();
        updateDivider();
        const themeStyle = document.getElementById('spot64-customize-styles');
        if (themeStyle && typeof MutationObserver !== 'undefined') {
            new MutationObserver(() => { updateDivider(); refreshControls(); }).observe(themeStyle, { childList: true, characterData: true, subtree: true });
        }
        updateQueue(true);
        setInterval(() => { if (root.isConnected) {
            updateQueue();
            refreshControls();
        } }, 2500);
        console.info(PREFIX, 'Ready: shuffle, repeat, queue, Recently Played, Top Tracks');
        return true;
    }
    const init = setInterval(() => { if (mount())
        clearInterval(init); }, 250);
})();
