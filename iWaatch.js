// iWaatch main.js - Sora Module

async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const responseText = await soraFetch(`https://api.themoviedb.org/3/search/movie?api_key=adc48d20c0956934fb224de5c40bb85d&query=${encodedKeyword}`);
        const data = await responseText.json();

        if (!data || !data.results) {
            throw new Error('No results returned from TMDB');
        }

        const transformedResults = data.results.map(result => {
            return {
                title: result.title || result.name || result.original_title || result.original_name || "Untitled",
                image: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : '',
                href: `https://iwaatch.com/movie/${result.id}`
            };
        });

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Search error in searchResults:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const movieId = url.match(/https:\/\/iwaatch\.com\/movie\/([^\/]+)/)[1];
        const responseText = await soraFetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=adc48d20c0956934fb224de5c40bb85d`);
        const data = await responseText.json();

        if (!data) {
            throw new Error('No data returned for movie details');
        }

        const transformedResults = [{
            description: data.overview || 'No description available',
            aliases: `Duration: ${data.runtime ? data.runtime + " minutes" : 'Unknown'}`,
            airdate: `Released: ${data.release_date || 'Unknown'}`
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Duration: Unknown',
            airdate: 'Released: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        const movieId = url.match(/https:\/\/iwaatch\.com\/movie\/([^\/]+)/)[1];
        
        return JSON.stringify([
            { href: `https://iwaatch.com/movie/${movieId}`, number: 1, title: "Full Movie" }
        ]);
    } catch (error) {
        console.log('Episode error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const res = await fetchV2(url);
        const html = await res.text();

        if (!html) {
            throw new Error('No HTML returned for stream URL');
        }

        const videoMatch = html.match(/<video\s+src="([^"]+)"/);
        const subtitleMatch = html.match(/<track\s+src="([^"]+)"[^>]*label="Arabic"/);

        let streamUrl = '';
        if (videoMatch) {
            streamUrl = videoMatch[1];
        }

        let subtitleUrl = '';
        if (subtitleMatch) {
            subtitleUrl = subtitleMatch[1];
        }

        return JSON.stringify({
            streams: [{ title: "1080p", url: streamUrl }],
            subtitles: subtitleUrl
        });
    } catch (error) {
        console.log("Stream extract error:", error);
        return JSON.stringify({
            streams: [],
            subtitles: ''
        });
    }
}

// Helper function to perform fetch requests
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        const response = await fetchV2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
        if (!response || !response.ok) {
            throw new Error('Fetch failed');
        }
        return response;
    } catch (error) {
        console.log("Fetch error:", error);
        try {
            return await fetch(url, options);
        } catch (fetchError) {
            console.log("Fetch fallback error:", fetchError);
            return null;
        }
    }
}

// Helper function for checking some conditions
function _0xCheck() {
    var _0x1a = typeof _0xB4F2 === 'function';
    var _0x2b = typeof _0x7E9A === 'function';
    return _0x1a && _0x2b ? (function (_0x3c) {
        return _0x7E9A(_0x3c);
    })(_0xB4F2()) : !1;
}

// A function to obscure some logic, making it more complex and harder to track
function _0x7E9A(_) {
    return ((___, ____, _____, ______, ________, _________, __________, ___________, ____________, _____________) => {
        (____ = typeof ___), (____ = ___ && ___[String.fromCharCode(...[108, 101, 110, 103, 116, 104])]);
        ______ = [...String.fromCharCode(...[99, 114, 97, 110, 99, 105])];
        _______ = ___ ? [...___[String.fromCharCode(...[116, 111, 76, 111, 119, 101, 114, 67, 97, 115, 101])]()]: [];
        (________ = ________[String.fromCharCode(...[115, 108, 105, 99, 101])]()) && _______[String.fromCharCode(...[102, 111, 114, 69, 97, 99, 104])]((_________, ____________) => {
            (___________ = ________[String.fromCharCode(...[105, 110, 100, 101, 120, 79, 102])](_________)) >= 0 && ________[String.fromCharCode(...[115, 112, 108, 105, 99, 101])](___________, 1);
        }), ____ === String.fromCharCode(...[115, 116, 114, 105, 110, 103]) && _____ === 16 && ________[String.fromCharCode(...[108, 101, 110, 103, 116, 104])] === 0;
    })(_);
}
