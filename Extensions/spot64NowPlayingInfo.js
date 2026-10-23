(() => {
    'use strict';
    if (window.__spot64NowPlayingInfoLoaded)
        return;
    window.__spot64NowPlayingInfoLoaded = true;
    const el = (tag, cls = '', text = '') => {
        const node = document.createElement(tag);
        if (cls)
            node.className = cls;
        node.textContent = text;
        return node;
    };
    const style = el('style');
    style.id = 'spot64-now-playing-info-style';
    style.textContent = `
    #tm-root .tm-side > .tm-nowplaying {
      position:relative!important; overflow:visible!important;
      flex:0 0 auto!important;min-width:0!important;
      padding:19px 12px 10px!important;
      background-color:var(--tm-panel,#1a1c22);
    }
    #tm-root .tm-nowplaying > .tm-title {
      position:absolute!important;top:0!important;left:13px!important;
      transform:translateY(-50%);z-index:3;
      margin:0!important;padding:0 6px!important;
      line-height:1.2!important;white-space:nowrap;
      background:var(--tm-heading-surface,var(--tm-panel,#1a1c22))!important;
      max-width:calc(100% - 28px);overflow:hidden;text-overflow:ellipsis;
    }
    #tm-root .tm-nowplaying .tm-nowplaying-fields {
      display:grid;grid-template-columns:52px minmax(0,1fr);
      gap:3px 9px;align-items:baseline;min-width:0;
      font-size:.85em;line-height:1.3;
    }
    #tm-root .tm-nowplaying .tm-nowplaying-key {color:var(--tm-dim,#aaaeb9);opacity:.82;}
    #tm-root .tm-nowplaying .tm-nowplaying-value {
      min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    }
    @media(max-width:680px){
      #tm-root .tm-side > .tm-nowplaying{padding:17px 8px 8px!important;}
      #tm-root .tm-nowplaying > .tm-title{left:9px!important;}
      #tm-root .tm-nowplaying .tm-nowplaying-fields{grid-template-columns:43px minmax(0,1fr);gap:2px 5px;font-size:.82em;}
    }
  `;
    document.head.append(style);
    let player, values, lastUri = '', requestVersion = 0;
    const cache = new Map();
    const names = ['Title', 'Artist', 'Album', 'Year', 'Length', 'Genre'];
    const safe = value => typeof value === 'string' && value.trim() ? value.trim() : '—';
    function setValue(key, value) {
        const node = values?.[key];
        if (!node)
            return;
        const display = safe(value);
        if (node.textContent !== display)
            node.textContent = display;
        node.title = display === '—' ? '' : display;
    }
    function duration(ms) {
        const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
        return total ? Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0') : '—';
    }
    function currentItem() {
        const d = player?.data;
        return d?.item || d?.track || null;
    }
    function readBase() {
        const item = currentItem();
        const md = item?.metadata || {};
        const uri = item?.uri || md.uri || '';
        const title = item?.name || md.title || md.track_name;
        const artists = Array.isArray(item?.artists) ? item.artists.map(a => a?.name || a?.profile?.name).filter(Boolean).join(', ') : '';
        const artist = artists || md.artist_name || item?.artist?.name;
        const album = item?.album?.name || item?.albumOfTrack?.name || md.album_title;
        const year = String(item?.album?.release_date || item?.album?.date?.year || md.album_release_year || md.release_year || '').slice(0, 4);
        const length = duration(item?.duration?.milliseconds || item?.duration_ms || item?.duration?.totalMilliseconds || player?.getDuration?.());
        return { uri, title, artist, album, year, length };
    }
    async function fetchMetadata(uri, token) {
        const id = uri.split(':')[2];
        if (!/^[A-Za-z0-9]{22}$/.test(id))
            return;
        if (cache.has(id)) {
            showExtra(cache.get(id), token);
            return;
        }
        const S = window.Spicetify;
        if (typeof S?.CosmosAsync?.get !== 'function')
            return;
        const extra = { year: '', genre: '' };
        try {
            const track = await S.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + id);
            extra.year = String(track?.album?.release_date || '').slice(0, 4);
            const artistId = track?.artists?.[0]?.id || (track?.artists?.[0]?.uri || '').split(':')[2];
            if (/^[A-Za-z0-9]{22}$/.test(artistId || '')) {
                try {
                    const artist = await S.CosmosAsync.get('https://api.spotify.com/v1/artists/' + artistId);
                    extra.genre = Array.isArray(artist?.genres) ? artist.genres.slice(0, 2).join(', ') : '';
                }
                catch (_) { }
            }
        }
        catch (_) { }
        if (cache.size >= 100)
            cache.delete(cache.keys().next().value);
        cache.set(id, extra);
        showExtra(extra, token);
    }
    function showExtra(extra, token) {
        if (token !== requestVersion)
            return;
        if (extra.year)
            setValue('Year', extra.year);
        if (extra.genre)
            setValue('Genre', extra.genre);
    }
    function update() {
        if (!values)
            return;
        const data = readBase();
        const next = data.uri;
        const changed = next !== lastUri;
        if (changed) {
            lastUri = next;
            requestVersion++;
        }
        setValue('Title', data.title);
        setValue('Artist', data.artist);
        setValue('Album', data.album);
        setValue('Length', data.length);
        if (changed) {
            setValue('Year', data.year);
            setValue('Genre', '');
            if (next?.startsWith('spotify:track:'))
                fetchMetadata(next, requestVersion);
        }
        else if (data.year && values.Year?.textContent === '—') {
            setValue('Year', data.year);
        }
    }
    function init() {
        const root = document.getElementById('tm-root');
        const side = root?.querySelector('.tm-main > .tm-side');
        const playlists = side?.querySelector('.tm-playlists');
        const S = window.Spicetify;
        if (!side || !playlists || !S?.Player)
            return false;
        if (side.querySelector('.tm-nowplaying'))
            return true;
        player = S.Player;
        const panel = el('section', 'tm-panel tm-nowplaying');
        panel.append(el('div', 'tm-title', 'NOW PLAYING'));
        const fields = el('div', 'tm-nowplaying-fields');
        values = {};
        for (const name of names) {
            fields.append(el('span', 'tm-nowplaying-key', name));
            const value = el('span', 'tm-nowplaying-value', '—');
            values[name] = value;
            fields.append(value);
        }
        panel.append(fields);
        playlists.insertAdjacentElement('afterend', panel);
        player.addEventListener?.('songchange', update);
        player.addEventListener?.('onupdate', update);
        update();
        return true;
    }
    if (!init()) {
        let attempts = 0;
        const timer = setInterval(() => { if (init() || ++attempts > 120)
            clearInterval(timer); }, 250);
    }
})();
