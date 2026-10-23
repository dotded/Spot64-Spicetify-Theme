(() => {
    'use strict';
    const ID = 'tm-root';
    let started = false;
    function boot() {
        if (started || document.getElementById(ID))
            return;
        if (!window.Spicetify?.Player || !window.Spicetify?.CosmosAsync || !document.body) {
            setTimeout(boot, 400);
            return;
        }
        started = true;
        const S = window.Spicetify;
        const el = (tag, cls = '', text = '') => {
            const node = document.createElement(tag);
            if (cls)
                node.className = cls;
            node.textContent = text;
            return node;
        };
        const root = el('div');
        root.id = ID;
        const top = el('header', 'tm-top');
        const exit = el('button', 'tm-exit', 'Show Spotify  [Ctrl+Shift+M]');
        exit.onclick = () => { root.hidden = true; };
        top.append(exit);
        root.append(top);
        const main = el('main', 'tm-main');
        const side = el('aside', 'tm-side');
        const library = el('section', 'tm-panel tm-library');
        library.append(el('div', 'tm-title', 'Spot64'));
        const playlists = el('section', 'tm-panel tm-playlists');
        playlists.append(el('div', 'tm-title', 'PLAYLISTS'));
        const playlistList = el('div', 'tm-list');
        playlists.append(playlistList);
        const playlistsFillStyle = el('style');
        playlistsFillStyle.textContent = `
      #tm-root .tm-side > .tm-playlists {
        flex: 1 1 0 !important;
        min-height: 0 !important;
        max-height: none !important;
        display: flex !important;
        flex-direction: column !important;
      }
      #tm-root .tm-side > .tm-playlists .tm-list {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
      }
    `;
        playlists.append(playlistsFillStyle);
        side.append(library, playlists);
        const browser = el('section', 'tm-panel tm-browser');
        const head = el('div', 'tm-browser-head');
        const title = el('div', 'tm-title', 'YOUR MUSIC');
        const count = el('span', 'tm-muted', '');
        head.append(title, count);
        browser.append(head);
        const searchForm = el('form', 'tm-search-form');
        const searchInput = el('input', 'tm-search-input');
        searchInput.type = 'search';
        searchInput.placeholder = 'Search all Spotify songs...';
        searchInput.setAttribute('aria-label', 'Search Spotify songs');
        searchInput.autocomplete = 'off';
        const searchButton = el('button', 'tm-search-button', 'SEARCH');
        searchButton.type = 'submit';
        searchForm.append(searchInput, searchButton);
        browser.append(searchForm);
        const trackColumns = el('div', 'tm-track-columns');
        ['TRACK', 'ARTIST', 'ALBUM', 'LENGTH'].forEach(label => trackColumns.append(el('span', '', label)));
        browser.append(trackColumns);
        const trackList = el('div', 'tm-tracks');
        browser.append(trackList);
        const trackColumnsStyle = el('style');
        trackColumnsStyle.textContent = `
      #tm-root .tm-track-columns,
      #tm-root .tm-tracks > .tm-track {
        display: grid !important;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1.45fr) minmax(0, 1.45fr) 62px;
        align-items: center;
        column-gap: 12px;
      }
      #tm-root .tm-track-columns { padding: 7px 12px; opacity: .67; font-size: 11px; }
      #tm-root .tm-track-columns > span,
      #tm-root .tm-tracks > .tm-track > span {
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      #tm-root .tm-track-columns > span:last-child,
      #tm-root .tm-tracks > .tm-track > span:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    `;
        browser.append(trackColumnsStyle);
        main.append(side, browser);
        root.append(main);
        const artwork = el('section', 'tm-artwork');
        const artworkText = el('pre', 'tm-artwork-text', 'ASCII ARTWORK READY\n\nAnimation will appear here.');
        artworkText.textContent =
            'ASCII ARTWORK READY\n\nAnimation will appear here.';
        artwork.append(artworkText);
        main.append(artwork);
        const footer = el('footer', 'tm-footer');
        const artToggle = el('button', 'tm-art-toggle', '\u2191');
        artToggle.textContent = '\u2191';
        artToggle.type = 'button';
        artToggle.title = 'Show ASCII artwork';
        artToggle.setAttribute('aria-label', 'Show ASCII artwork');
        artToggle.setAttribute('aria-pressed', 'false');
        artToggle.addEventListener('click', () => {
            const active = root.classList.toggle('tm-art-mode');
            artToggle.textContent = active ? '\u2193' : '\u2191';
            artToggle.title = active
                ? 'Show library and tracks'
                : 'Show ASCII artwork';
            artToggle.setAttribute('aria-label', artToggle.title);
            artToggle.setAttribute('aria-pressed', String(active));
        });
        footer.append(artToggle);
        const playerRow = el('div', 'tm-player-row');
        const song = el('span', 'tm-song', 'Nothing playing');
        const actions = el('div', 'tm-actions');
        const time = el('span', 'tm-time tm-muted', '00:00 / 00:00');
        const action = (label, hint, fn) => {
            const b = el('button', '', label);
            b.title = hint;
            b.setAttribute('aria-label', hint);
            b.onclick = () => { try {
                fn();
            }
            catch (err) {
                console.warn('[Spot64]', err);
            } };
            actions.append(b);
            return b;
        };
        action('\u23EE', 'Previous', () => S.Player.back());
        const playButton = action('\u25B6', 'Play or pause', () => S.Player.togglePlay());
        action('\u23ED', 'Next', () => S.Player.next());
        playerRow.append(song, actions, time);
        const seek = el('input', 'tm-seek');
        seek.type = 'range';
        seek.min = '0';
        seek.max = '100';
        seek.value = '0';
        seek.setAttribute('aria-label', 'Seek playback');
        seek.addEventListener('change', () => {
            const duration = S.Player.getDuration?.() || 0;
            if (duration)
                S.Player.seek(Math.round(duration * Number(seek.value) / 100));
        });
        footer.append(seek, playerRow);
        root.append(footer);
        document.body.append(root);
        const state = { selected: null, tracks: [], selectedButton: null, request: 0, lastUri: null };
        const api = async (path) => {
            try {
                const response = await S.CosmosAsync.get('https://api.spotify.com/v1/' + path);
                if (!response || typeof response !== 'object' || response.error) {
                    throw new Error(response?.error?.message || 'Unexpected Spotify API response');
                }
                return response;
            }
            catch (error) {
                const message = String(error?.message || error);
                if (/429|rate.?limit|too many requests/i.test(message)) {
                    throw new Error('Spotify is rate limiting library requests (HTTP 429). Wait before retrying.');
                }
                throw error;
            }
        };
        const errorMessage = (error) => String(error?.message || error || 'Unknown error').slice(0, 220);
        const requireItems = (data, name) => {
            if (!Array.isArray(data?.items))
                throw new Error(`${name}: Spotify returned no items array (not an empty library).`);
            return data.items;
        };
        const uriId = (uri) => String(uri || '').split(':').pop();
        const artistNames = (track) => (track?.artists || []).map(a => a.name).join(', ');
        const showStatus = (message) => { trackList.replaceChildren(el('div', 'tm-status tm-muted', message)); };
        function markActive(button) {
            if (state.selectedButton)
                state.selectedButton.classList.remove('tm-active');
            state.selectedButton = button;
            button?.classList.add('tm-active');
        }
        async function paginate(path, key, maxPages = 5) {
            const output = [];
            let next = path;
            for (let page = 0; page < maxPages && next; page++) {
                const data = await api(next.startsWith('https://api.spotify.com/v1/') ? next.slice('https://api.spotify.com/v1/'.length) : next);
                if (!Array.isArray(data?.[key]))
                    throw new Error('Unexpected Spotify response: missing ' + key);
                output.push(...data[key]);
                next = data?.next || null;
            }
            return output;
        }
        async function openCollection(label, load, contextUri, button) {
            const request = ++state.request;
            state.selected = { label, contextUri };
            markActive(button);
            title.textContent = label.toUpperCase();
            count.textContent = '';
            showStatus('Loading tracksâ€¦');
            try {
                const tracks = await load();
                if (request !== state.request)
                    return;
                state.tracks = tracks.filter(t => t?.uri && t?.name);
                renderTracks();
            }
            catch (error) {
                if (request !== state.request)
                    return;
                console.warn('[Spot64] Could not load collection:', error);
                showStatus('Could not load tracks: ' + errorMessage(error) + '  â€¢  Use Show Spotify to browse normally.');
            }
        }
        const menuStyle = el('style');
        menuStyle.textContent = `
      #tm-context-menu { position:fixed; z-index:2147483647; min-width:230px;
        background:#111317; color:#eee; border:1px solid #777;
        padding:5px; box-shadow:0 8px 24px #000b; font:12px monospace; }
      #tm-context-menu button { display:block; width:100%; padding:10px 12px;
        text-align:left; color:inherit; background:transparent; border:0;
        font:inherit; cursor:pointer; }
      #tm-context-menu button:hover:not(:disabled) { background:#30343b; }
      #tm-context-menu button:disabled { opacity:.45; cursor:not-allowed; }
      #tm-context-menu .tm-menu-divider { border-top:1px solid #555; margin:4px 2px; }
      #tm-context-menu .tm-menu-label { padding:7px 12px; color:#999;
        overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:250px; }
    `;
        document.head.append(menuStyle);
        const contextMenu = el('div');
        contextMenu.id = 'tm-context-menu';
        contextMenu.hidden = true;
        document.body.append(contextMenu);
        const closeContextMenu = () => { contextMenu.hidden = true; contextMenu.replaceChildren(); };
        document.addEventListener('pointerdown', event => {
            if (!contextMenu.hidden && !contextMenu.contains(event.target))
                closeContextMenu();
        }, true);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape')
                closeContextMenu();
        });
        window.addEventListener('blur', closeContextMenu);
        window.addEventListener('resize', closeContextMenu);
        const getLikedStatus = async (uri) => {
            const result = await S.Platform.LibraryAPI.contains(uri);
            if (!Array.isArray(result) || typeof result[0] !== 'boolean') {
                throw new Error('Unexpected liked-status response');
            }
            return result[0];
        };
        async function toggleLiked(track, itemButton) {
            try {
                const libraryAPI = S.Platform?.LibraryAPI;
                if (typeof libraryAPI?.contains !== 'function' ||
                    typeof libraryAPI?.add !== 'function' ||
                    typeof libraryAPI?.remove !== 'function') {
                    throw new Error('Liked Songs API unavailable');
                }
                const liked = await getLikedStatus(track.uri);
                if (liked)
                    await libraryAPI.remove({ uris: [track.uri] });
                else
                    await libraryAPI.add({ uris: [track.uri] });
                const nowLiked = await getLikedStatus(track.uri);
                if (nowLiked === liked)
                    throw new Error('Spotify did not confirm the change');
                S.showNotification?.(nowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
                if (itemButton)
                    itemButton.textContent = nowLiked ? '♥ REMOVE FROM LIKED SONGS' : '♡ ADD TO LIKED SONGS';
            }
            catch (error) {
                console.error('[Spot64] Like action failed:', error);
                S.showNotification?.('Liked Songs update failed; see console', true);
            }
        }
        function showTrackMenu(event, track, index) {
            event.preventDefault();
            event.stopPropagation();
            contextMenu.replaceChildren();
            const option = (label, handler, disabled = false, tooltip = '') => {
                const b = el('button', '', label);
                b.type = 'button';
                b.disabled = disabled;
                if (tooltip)
                    b.title = tooltip;
                b.onclick = () => { closeContextMenu(); handler(b); };
                contextMenu.append(b);
                return b;
            };
            option('▶ PLAY', () => playTrack(track, index));
            option('+ ADD TO QUEUE', async () => {
                try {
                    const queue = S.Platform.PlayerAPI._queue;
                    if (!queue || typeof queue.addToQueue !== 'function') {
                        throw new Error('Spotify queue API unavailable');
                    }
                    const before = queue.getQueue()?.queued || [];
                    const previousCount = before.length;
                    await queue.addToQueue([{ uri: track.uri }], {});
                    let confirmed = false;
                    for (let attempt = 0; attempt < 15; attempt++) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        const queued = queue.getQueue()?.queued || [];
                        if (queued.length > previousCount) {
                            confirmed = true;
                            break;
                        }
                    }
                    if (!confirmed) {
                        throw new Error('Spotify did not confirm queue insertion');
                    }
                    S.showNotification?.('Added to Queue');
                }
                catch (error) {
                    console.error('[Spot64] Queue action failed:', error);
                    S.showNotification?.('Could not add to Queue; see console', true);
                }
            });
            contextMenu.append(el('div', 'tm-menu-divider'));
            const likeButton = option('♡ CHECKING LIKED SONGS…', () => toggleLiked(track), true);
            const menuTrack = track.uri;
            if (typeof S.Platform?.LibraryAPI?.contains === 'function') {
                getLikedStatus(track.uri).then(liked => {
                    if (contextMenu.hidden || menuTrack !== contextMenu.dataset.uri)
                        return;
                    likeButton.disabled = false;
                    likeButton.textContent = liked ? '♥ REMOVE FROM LIKED SONGS' : '♡ ADD TO LIKED SONGS';
                }).catch(error => {
                    console.warn('[Spot64] Could not check liked status:', error);
                    likeButton.textContent = '♡ LIKED SONGS UNAVAILABLE';
                });
            }
            else
                likeButton.textContent = '♡ LIKED SONGS UNAVAILABLE';
            option('ADD TO PLAYLIST  >', async () => {
                try {
                    const rootlist = await S.Platform.RootlistAPI.getContents();
                    const playlists = [];
                    function collect(items) {
                        for (const item of items || []) {
                            if (item.type === 'playlist' && item.uri) {
                                playlists.push({ name: item.name, uri: item.uri });
                            }
                            if (item.items)
                                collect(item.items);
                        }
                    }
                    collect(rootlist.items);
                    if (!playlists.length) {
                        S.showNotification?.('No playlists found', true);
                        return;
                    }
                    contextMenu.replaceChildren();
                    const back = el('button', '', '← BACK');
                    back.type = 'button';
                    back.onclick = () => closeContextMenu();
                    contextMenu.append(back);
                    for (const playlist of playlists) {
                        const button = el('button', '', '› ' + playlist.name);
                        button.type = 'button';
                        button.onclick = async () => {
                            closeContextMenu();
                            try {
                                await S.Platform.PlaylistAPI.add(playlist.uri, [track.uri], {});
                                S.showNotification?.('Added to ' + playlist.name);
                            }
                            catch (error) {
                                console.error('[Spot64] Add to Playlist failed:', error);
                                S.showNotification?.('Could not add to playlist', true);
                            }
                        };
                        contextMenu.append(button);
                    }
                    contextMenu.hidden = false;
                }
                catch (error) {
                    console.error('[Spot64] Playlist picker failed:', error);
                    S.showNotification?.('Could not load playlists', true);
                }
            });
            option('GO TO SONG RADIO', () => goToSongRadio(track));
            contextMenu.dataset.uri = track.uri;
            contextMenu.hidden = false;
            const rect = contextMenu.getBoundingClientRect();
            contextMenu.style.left = Math.max(4, Math.min(event.clientX, innerWidth - rect.width - 8)) + 'px';
            contextMenu.style.top = Math.max(18, Math.min(event.clientY, innerHeight - rect.height - 8)) + 'px';
        }
        function renderTracks() {
            state.lastUri = null;
            trackList.replaceChildren();
            count.textContent = `${state.tracks.length} tracks`;
            if (!state.tracks.length) {
                showStatus('No tracks found.');
                return;
            }
            const frag = document.createDocumentFragment();
            const current = S.Player.data?.item?.uri;
            state.tracks.forEach((track, index) => {
                const button = el('button', 'tm-track');
                if (track.uri === current)
                    button.classList.add('tm-current');
                button.title = `${track.name} - ${artistNames(track)}`;
                const albumName = track.albumName || 'â€”';
                const trackLength = track.duration > 0 ? fmt(track.duration) : 'â€”';
                button.append(el('span', '', track.name), el('span', 'tm-muted', artistNames(track)), el('span', 'tm-muted', albumName), el('span', 'tm-muted', trackLength));
                button.onclick = () => playTrack(track, index);
                button.addEventListener('contextmenu', event => showTrackMenu(event, track, index));
                frag.append(button);
            });
            trackList.append(frag);
        }
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        function playbackMatches(uri, context) {
            const data = S.Player.data;
            return data?.item?.uri === uri && (!context || data?.context?.uri === context);
        }
        async function waitForTrack(uri, context, timeoutMs = 5000) {
            const deadline = Date.now() + timeoutMs;
            while (Date.now() < deadline) {
                if (playbackMatches(uri, context))
                    return true;
                await wait(180);
            }
            return playbackMatches(uri, context);
        }
        async function disableSuggestedContinuation() {
            const setting = S.Platform?.SettingsAPI?.autoPlay;
            const product = S.Platform?.ProductStateAPI;
            const backupKey = 'spot64.autoplay.before-playlist-fix';
            if (setting?.setValue && setting?.getValue) {
                const before = await setting.getValue();
                if (localStorage.getItem(backupKey) === null)
                    localStorage.setItem(backupKey, JSON.stringify(before));
                if (before)
                    await setting.setValue(false);
                if (await setting.getValue())
                    throw new Error('Spotify autoplay is still enabled');
            }
            else if (product?.setValues && product?.getValues) {
                const before = await product.getValues();
                if (localStorage.getItem(backupKey) === null)
                    localStorage.setItem(backupKey, JSON.stringify(before.autoplay ?? '1'));
                if (before.autoplay !== '0')
                    await product.setValues({ autoplay: '0' });
                if ((await product.getValues()).autoplay !== '0')
                    throw new Error('Spotify autoplay is still enabled');
            }
            else {
                throw new Error('Spotify autoplay setting is unavailable; playlist-only playback could not be guaranteed');
            }
        }
        async function preparePlaylist(context) {
            await disableSuggestedContinuation();
            const shuffle = S.Platform?.ContextualShuffleAPI || S.Player.origin?._contextualShuffle;
            if (shuffle?.getContextualShuffleMode && shuffle?.setContextualShuffleMode) {
                if (await shuffle.getContextualShuffleMode(context) === 2) {
                    await shuffle.setContextualShuffleMode(context, 1);
                }
            }
        }
        async function goToSongRadio(track) {
            const request = ++state.request;
            try {
                const response = await S.CosmosAsync.get('https://spclient.wg.spotify.com/inspiredby-mix/v2/seed_to_playlist/' + track.uri + '?response-format=json');
                const uri = response?.mediaItems?.[0]?.uri;
                if (!uri?.startsWith('spotify:playlist:'))
                    throw new Error('Spotify did not return a song radio playlist');
                const tracks = await getPlaylistTracks(uri);
                if (request !== state.request)
                    return;
                if (!tracks.length)
                    throw new Error('Song radio is empty');
                await openCollection(track.name + ' RADIO', async () => tracks, uri, null);
                const selection = state.selected;
                const first = state.tracks[0];
                await playTrack(first, 0);
                if (state.selected === selection && playbackMatches(first.uri, uri)) {
                    selection.radioSession = true;
                }
            }
            catch (error) {
                console.warn('[Spot64] Song radio failed:', error);
                S.showNotification?.('Could not open song radio: ' + errorMessage(error), true);
            }
        }
        let playRequest = 0;
        async function playTrack(track, index) {
            const request = ++playRequest;
            const row = trackList.children[index];
            if (row)
                row.classList.add('tm-pending');
            const context = state.selected?.contextUri;
            const attempts = [];
            const collection = context?.startsWith('spotify:playlist:') || context === 'spotify:collection:tracks';
            const options = collection ? { skipTo: { uri: track.uri }, modes: { context_enhancement: 'NONE' } } : {};
            const uri = collection ? context : track.uri;
            if (typeof S.Player.playUri === 'function') {
                attempts.push(['Player.playUri(context, skipTo)', () => S.Player.playUri(uri, {}, options)]);
            }
            const origin = S.Player.origin || S.Platform?.PlayerAPI;
            if (typeof origin?.play === 'function') {
                attempts.push(['PlayerAPI.play(context, skipTo)', () => origin.play({ uri }, {}, options)]);
            }
            let lastError = null;
            try {
                if (state.selected?.radioSession) {
                    if (S.Player.data?.context?.uri !== context) {
                        throw new Error('This radio session is no longer active. Use GO TO SONG RADIO to start another.');
                    }
                    if (!playbackMatches(track.uri, context)) {
                        if (typeof origin?.skipTo !== 'function')
                            throw new Error('Radio queue navigation is unavailable');
                        const queue = origin.getQueue?.();
                        const queued = [...(queue?.queued || []), ...(queue?.nextUp || [])].find(item => item.uri === track.uri);
                        await origin.skipTo({ uri: track.uri, ...(queued?.uid ? { uid: queued.uid } : {}) });
                        if (!await waitForTrack(track.uri, context))
                            throw new Error('Spotify did not select the song within this radio');
                    }
                    if (request !== playRequest)
                        return;
                    if (!S.Player.isPlaying?.())
                        await S.Player.togglePlay?.();
                    refreshPlayer();
                    return;
                }
                if (collection)
                    await preparePlaylist(context);
                for (const [name, fn] of attempts) {
                    if (request !== playRequest)
                        return;
                    try {
                        await fn();
                        if (await waitForTrack(track.uri, collection ? context : null)) {
                            if (request !== playRequest)
                                return;
                            if (!S.Player.isPlaying?.())
                                await S.Player.togglePlay?.();
                            refreshPlayer();
                            return;
                        }
                        lastError = new Error(name + ' did not switch to the requested track and collection');
                    }
                    catch (error) {
                        lastError = error;
                        console.warn('[Spot64] Playback method failed:', name, error);
                    }
                }
                throw lastError || new Error('No playback method is available');
            }
            catch (error) {
                if (request !== playRequest)
                    return;
                console.error('[Spot64] All playback methods failed:', error);
                S.showNotification?.('Playback failed: ' + errorMessage(error), true);
            }
            finally {
                row?.classList.remove('tm-pending');
            }
        }
        function normalizeSearchTrack(entry) {
            if (entry?.item?.__typename !== 'TrackResponseWrapper')
                return null;
            const raw = entry.item.data;
            if (!raw?.uri?.startsWith('spotify:track:') || !raw.name)
                return null;
            if (raw.playability?.playable === false)
                return null;
            const artistItems = Array.isArray(raw.artists?.items) ? raw.artists.items
                : Array.isArray(raw.artists) ? raw.artists : [];
            const artists = artistItems.map(a => ({
                name: a?.profile?.name || a?.data?.profile?.name || a?.name || a?.data?.name || ''
            })).filter(a => a.name);
            return {
                uri: raw.uri,
                name: raw.name,
                artists,
                duration: raw.duration?.totalMilliseconds || raw.duration?.milliseconds || 0,
                albumName: raw.albumOfTrack?.name || raw.album?.name || raw.album?.data?.name || ''
            };
        }
        async function searchSpotify(event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (!query) {
                searchInput.focus();
                return;
            }
            const request = ++state.request;
            state.selected = { label: 'Search', contextUri: null };
            markActive(null);
            title.textContent = 'SEARCH / ' + query.toUpperCase();
            count.textContent = '';
            showStatus('Searching Spotifyâ€¦');
            searchButton.disabled = true;
            try {
                const gql = S.GraphQL;
                if (typeof gql?.Request !== 'function' || !gql.Definitions?.searchSuggestions) {
                    throw new Error('Spotify GraphQL searchSuggestions is unavailable in this client.');
                }
                const result = await gql.Request(gql.Definitions.searchSuggestions, {
                    query,
                    limit: 50,
                    numberOfTopResults: 50,
                    offset: 0,
                    includeAuthors: true,
                    includePreReleases: false,
                    includeAudiobooks: true
                });
                if (request !== state.request)
                    return;
                if (Array.isArray(result?.errors) && result.errors.length) {
                    throw new Error(result.errors[0]?.message || 'Spotify search returned an error.');
                }
                const entries = result?.data?.searchV2?.topResultsV2?.itemsV2;
                if (!Array.isArray(entries))
                    throw new Error('Spotify returned an unexpected search response.');
                const seen = new Set();
                state.tracks = entries.map(normalizeSearchTrack).filter(track => {
                    if (!track || seen.has(track.uri))
                        return false;
                    seen.add(track.uri);
                    return true;
                });
                renderTracks();
                if (!state.tracks.length)
                    showStatus('No song results. Try a different search.');
            }
            catch (error) {
                if (request !== state.request)
                    return;
                console.warn('[Spot64] Search failed:', error);
                count.textContent = '';
                showStatus('Search failed: ' + errorMessage(error));
            }
            finally {
                searchButton.disabled = false;
            }
        }
        searchForm.addEventListener('submit', searchSpotify);
        function libraryButton(label, loader, context) {
            const b = el('button', 'tm-item', label);
            b.onclick = () => openCollection(label, loader, context, b);
            library.append(b);
            return b;
        }
        const VERIFIED_PLAYLIST = 'spotify:playlist:5XqxECUPmMDW0DoUP6b0Yz';
        const normalize = (item) => {
            const track = item?.track || item;
            if (!track || track.type !== 'track' || !track.uri || !track.name)
                return null;
            return {
                uri: track.uri, name: track.name,
                artists: Array.isArray(track.artists) ? track.artists : [],
                duration: track.duration?.milliseconds || 0,
                albumName: track.album?.name || track.album?.data?.name || track.albumName || ''
            };
        };
        async function getPlaylistTracks(uri) {
            const playlistAPI = S.Platform?.PlaylistAPI;
            if (typeof playlistAPI?.getContents !== 'function') {
                throw new Error('Spotify internal PlaylistAPI.getContents is unavailable.');
            }
            const all = [];
            let offset = 0;
            for (let page = 0; page < 20; page++) {
                const result = page === 0
                    ? await playlistAPI.getContents(uri)
                    : await playlistAPI.getContents(uri, { offset, limit: 100 });
                if (!Array.isArray(result?.items))
                    throw new Error('PlaylistAPI returned no items array.');
                all.push(...result.items);
                const next = Number(result.offset || offset) + result.items.length;
                const total = Number(result.totalLength ?? all.length);
                if (!result.items.length || next >= total || next <= offset)
                    break;
                offset = next;
            }
            return all.map(normalize).filter(Boolean);
        }
        function showUnavailable(label) {
            return async () => {
                throw new Error(label + ' is not yet connected. Use Show Spotify to browse it in the native interface.');
            };
        }
        async function getLikedTracks() {
            const getTracks = S.Platform?.LibraryAPI?.getTracks;
            if (typeof getTracks !== 'function') {
                throw new Error('Spotify internal LibraryAPI.getTracks is unavailable.');
            }
            const PAGE_SIZE = 20;
            const MAX_PAGES = 20;
            const all = [];
            const seen = new Set();
            for (let page = 0; page < MAX_PAGES; page++) {
                const offset = page * PAGE_SIZE;
                const result = await S.Platform.LibraryAPI.getTracks({ offset, limit: PAGE_SIZE });
                if (!Array.isArray(result?.items)) {
                    throw new Error('LibraryAPI.getTracks returned no items array.');
                }
                const items = result.items;
                let newCount = 0;
                for (const item of items) {
                    const raw = item?.track || item;
                    const track = raw?.uri?.startsWith('spotify:track:') && raw?.name
                        ? { uri: raw.uri, name: raw.name,
                            artists: Array.isArray(raw.artists) ? raw.artists : [],
                            duration: raw.duration?.milliseconds || 0,
                            albumName: raw.album?.name || raw.album?.data?.name || raw.albumName || '' }
                        : null;
                    if (track && !seen.has(track.uri)) {
                        seen.add(track.uri);
                        all.push(track);
                        newCount++;
                    }
                }
                if (items.length < PAGE_SIZE)
                    break;
                if (newCount === 0) {
                    console.warn('[Spot64] Liked Songs pagination repeated a page; stopping.');
                    break;
                }
                if (page === MAX_PAGES - 1) {
                    console.warn('[Spot64] Liked Songs reached the 400-track safety cap.');
                }
            }
            return all;
        }
        libraryButton('Liked Songs', getLikedTracks, 'spotify:collection:tracks');
        libraryButton('Recently Played', showUnavailable('Recently Played'));
        libraryButton('Top Tracks', showUnavailable('Top Tracks'));
        function addPlaylistButton(name, uri) {
            const button = el('button', 'tm-item', name);
            button.title = uri;
            button.onclick = () => openCollection(name, () => getPlaylistTracks(uri), uri, button);
            playlistList.append(button);
            return button;
        }
        async function discoverPlaylists() {
            const status = el('div', 'tm-status tm-muted', 'Finding playlistsâ€¦');
            playlistList.append(status);
            try {
                const rootlist = S.Platform?.RootlistAPI;
                if (typeof rootlist?.getContents !== 'function') {
                    throw new Error('RootlistAPI.getContents is unavailable');
                }
                const result = await rootlist.getContents();
                if (!Array.isArray(result?.items)) {
                    throw new Error('Rootlist response has no items array');
                }
                const found = new Map();
                const visit = (items) => {
                    for (const item of items) {
                        if (item?.type === 'playlist' && /^spotify:playlist:[A-Za-z0-9]+$/.test(item.uri || '')) {
                            if (!found.has(item.uri))
                                found.set(item.uri, item.name || 'Untitled Playlist');
                        }
                        if (Array.isArray(item?.items))
                            visit(item.items);
                    }
                };
                visit(result.items);
                if (!found.size)
                    throw new Error('No playlist entries were returned');
                status.remove();
                let first = null;
                for (const [uri, name] of found) {
                    const button = addPlaylistButton(name, uri);
                    if (!first)
                        first = button;
                }
                first?.click();
            }
            catch (error) {
                console.warn('[Spot64] Playlist discovery failed:', error);
                status.textContent = 'Playlist discovery unavailable. Showing saved playlist.';
                const fallback = addPlaylistButton('My Playlist (saved)', VERIFIED_PLAYLIST);
                fallback.click();
            }
        }
        let seekDragging = false;
        seek.addEventListener('pointerdown', () => { seekDragging = true; });
        const endSeekDrag = () => { seekDragging = false; };
        seek.addEventListener('pointerup', endSeekDrag);
        seek.addEventListener('pointercancel', endSeekDrag);
        seek.addEventListener('change', endSeekDrag);
        seek.addEventListener('blur', endSeekDrag);
        window.addEventListener('pointerup', endSeekDrag);
        window.addEventListener('pointercancel', endSeekDrag);
        const fmt = ms => { const n = Math.max(0, Math.floor((ms || 0) / 1000)); return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`; };
        function refreshPlayer() {
            const p = S.Player;
            const track = p.data?.item || p.data?.track?.metadata || null;
            song.textContent = track ? `${track.name} - ${artistNames(track)}` : "Nothing playing";
            const duration = track?.duration?.milliseconds || p.getDuration?.() || 0, position = p.getProgress?.() || 0;
            time.textContent = `${fmt(position)} / ${fmt(duration)}`;
            if (!seekDragging)
                seek.value = duration ? String(Math.max(0, Math.min(100, 100 * position / duration))) : '0';
            playButton.textContent = p.isPlaying?.() ? '\u23F8' : '\u25B6';
            if (state.lastUri !== track?.uri) {
                state.lastUri = track?.uri;
                for (const row of trackList.querySelectorAll('.tm-track'))
                    row.classList.remove('tm-current');
                const idx = state.tracks.findIndex(x => x.uri === track?.uri);
                if (idx >= 0)
                    trackList.children[idx]?.classList.add('tm-current');
            }
        }
        S.Player.addEventListener('songchange', refreshPlayer);
        S.Player.addEventListener('onplaypause', refreshPlayer);
        S.Player.addEventListener('onprogress', refreshPlayer);
        S.Player.addEventListener('onupdate', refreshPlayer);
        const playerTimer = setInterval(refreshPlayer, 1500);
        document.addEventListener('keydown', event => {
            if (event.ctrlKey && event.shiftKey && !event.altKey && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                root.hidden = !root.hidden;
            }
        });
        refreshPlayer();
        setTimeout(refreshPlayer, 500);
        discoverPlaylists();
    }
    boot();
})();
