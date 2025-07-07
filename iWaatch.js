async function searchResults(keyword) {
    const results = [];
    try {
        const searchUrl = `https://iwaatch.com/?q=${encodeURIComponent(keyword)}`;
        const headers = { 'User-Agent': 'Mozilla/5.0' };
        const response = await fetchV2(searchUrl, headers);
        const html = await response.text();
        // Find all anchors linking to movie pages
        const regex = /<a[^>]+href="(https?:\/\/iwaatch\.com\/movie\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const href = match[1];
            // Inner text contains "score Title Genre ..."
            const innerText = match[2].trim();
            // Extract title (English part before Arabic category)
            const titleMatch = innerText.match(/^\d+\.\d+\/10\s+(.+?)\s+[\u0600-\u06FF]/);
            const title = titleMatch ? titleMatch[1].trim() : innerText;
            // No clear image on search results; leave empty or could fetch from detail
            const image = "";
            if (title && href) {
                results.push({ title: title, image: image, href: href });
            }
        }
        // If no results found, return empty list
        return JSON.stringify(results);
    } catch (error) {
        console.log('Search error:', error);
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
    try {
        const headers = { 'User-Agent': 'Mozilla/5.0' };
        const response = await fetchV2(url, headers);
        const html = await response.text();
        // Description from "قصة الفيلم" section
        let description = "";
        const descMatch = html.match(/### قصة الفيلم\s*([\s\S]*?)<\/span>/) 
                       || html.match(/### قصة الفيلم\s*([\s\S]*?)\n/);
        if (descMatch) {
            description = descMatch[1].trim();
        }
        // Year (the first heading after title)
        let year = "";
        const yearMatch = html.match(/#\s*فيلم\s*.+?\n##\s*(\d{4})/);
        if (yearMatch) {
            year = yearMatch[1];
        }
        // Genre (categories line after year)
        let genres = "";
        const genreMatch = html.match(/##\s*([^\n]+)\n/);
        if (genreMatch) {
            genres = genreMatch[1].trim();
        }
        // Duration and rating
        let duration = "";
        let rating = "";
        const infoMatch = html.match(/<li>\s*([\dhm ]+min)\s*<\/li>\s*<li>\s*([\d.]+\/10)\s*<\/li>/);
        if (infoMatch) {
            duration = infoMatch[1].trim();
            rating = infoMatch[2].trim();
        }
        const details = {
            description: description || "",
            genre: genres,
            rating: rating,
            duration: duration,
            year: year
        };
        return JSON.stringify([details]);
    } catch (error) {
        console.log('Details error:', error);
        return JSON.stringify([{
            description: '',
            genre: '',
            rating: '',
            duration: '',
            year: ''
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        // Assuming 'url' is the movie page URL, transform to view page
        const match = url.match(/https?:\/\/iwaatch\.com\/movie\/(.+)$/);
        if (!match) {
            return JSON.stringify([]);
        }
        const movieId = match[1];
        const viewUrl = `https://iwaatch.com/view/${movieId}`;
        const episodes = [{
            href: viewUrl,
            number: "1"
        }];
        return JSON.stringify(episodes);
    } catch (error) {
        console.log('Episodes error:', error);
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const headers = { 'User-Agent': 'Mozilla/5.0' };
        const response = await fetchV2(url, headers);
        const html = await response.text();
        const streams = {};
        // Extract <source> URLs
        const sourceRegex = /<source[^>]+src="([^"]+)"[^>]*>/g;
        let match;
        while ((match = sourceRegex.exec(html)) !== null) {
            const src = match[1];
            if (src.includes("1080")) {
                streams["1080p"] = src;
            } else if (src.includes("720")) {
                streams["720p"] = src;
            } else if (src.includes("480")) {
                streams["480p"] = src;
            }
        }
        // Extract Arabic subtitle track
        let subtitles = "";
        const trackMatch = html.match(/<track[^>]+src="([^"]+\.vtt)"[^>]+srclang="ar"/);
        if (trackMatch) {
            subtitles = trackMatch[1];
        }
        const result = { streams: streams, subtitles: subtitles };
        return JSON.stringify(result);
    } catch (error) {
        console.log('StreamUrl error:', error);
        return JSON.stringify({ streams: {}, subtitles: "" });
    }
}
