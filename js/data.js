// Data Loading Module
const DataModule = (() => {
    let adsData = [];
    let filteredData = [];
    let metadata = {
        keywords: [],
        mediaTypes: [],
        ctaTypes: [],
        platforms: [],
        advertisers: [],
        runningDaysRange: { min: 0, max: 0 },
        likesRange: { min: 0, max: 0 },
        dateRange: { min: '', max: '' },
        countries: []
    };

    // Load data from JSON file
    async function loadData() {
        try {
            const response = await fetch('data/ads.json');
            if (!response.ok) throw new Error('Failed to load data');
            const json = await response.json();
            adsData = json.ads || [];
            adsData.forEach(ad => {
                ad.country = detectCountry(ad);
            });
            filteredData = [...adsData];
            extractMetadata();
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    // Detect country from ad URL and text content
    function detectCountry(ad) {
        const url = ((ad.landing_page || '') + ' ' + (ad.landing_page_domain || '')).toLowerCase();
        const rawText = (ad.ad_text || '') + ' ' + (ad.title || '') + ' ' + (ad.advertiser_name || '');
        const text = rawText.toLowerCase();

        // Bangladesh (BD): URL has .bd / bkash / nagad / rocket / bdbajee / baji; or Bengali script in text
        if (/\.bd\b/.test(url) || /bkash|nagad|rocket|bdbajee|baji/.test(url) || /[\u0980-\u09FF]/.test(rawText)) {
            return 'BD';
        }

        // Thailand (TH): URL has .th / 168 / csalepage; or Thai script in text
        if (/\.th\b/.test(url) || /168|csalepage/.test(url) || /[\u0E00-\u0E7F]/.test(rawText)) {
            return 'TH';
        }

        // Brazil (BR): URL or text has .br / pix / betano / jogo / brazil
        const combined = url + ' ' + text;
        if (/\.br\b/.test(combined) || /pix|betano|jogo|brazil/.test(combined)) {
            return 'BR';
        }

        // India (IN): text has ₹ / inr / paytm
        if (/₹/.test(rawText) || /\binr\b/.test(text) || /paytm/.test(text)) {
            return 'IN';
        }

        return 'Global';
    }

    // Extract unique values for filters
    function extractMetadata() {
        const keywordsSet = new Set();
        const mediaTypesSet = new Set();
        const ctaTypesSet = new Set();
        const platformsSet = new Set();
        const advertisersMap = new Map();
        const countriesSet = new Set();

        let minDays = Infinity, maxDays = 0;
        let minLikes = Infinity, maxLikes = 0;
        let minDate = '', maxDate = '';

        adsData.forEach(ad => {
            // Keywords
            if (ad.keyword) keywordsSet.add(ad.keyword);

            // Media types
            if (ad.media_type) mediaTypesSet.add(ad.media_type);

            // CTA types
            if (ad.cta_type) ctaTypesSet.add(ad.cta_type);

            // Platforms
            if (ad.publisher_platforms) {
                ad.publisher_platforms.forEach(p => platformsSet.add(p));
            }

            // Advertisers
            if (ad.advertiser_name) {
                const count = advertisersMap.get(ad.advertiser_name) || 0;
                advertisersMap.set(ad.advertiser_name, count + 1);
            }

            // Running days range
            if (ad.running_days) {
                minDays = Math.min(minDays, ad.running_days);
                maxDays = Math.max(maxDays, ad.running_days);
            }

            // Likes range
            if (ad.page_like_count) {
                minLikes = Math.min(minLikes, ad.page_like_count);
                maxLikes = Math.max(maxLikes, ad.page_like_count);
            }

            // Date range
            if (ad.first_seen) {
                if (!minDate || ad.first_seen < minDate) minDate = ad.first_seen;
            }
            if (ad.last_seen) {
                if (!maxDate || ad.last_seen > maxDate) maxDate = ad.last_seen;
            }

            // Country
            if (ad.country) countriesSet.add(ad.country);
        });

        // Convert to arrays and sort
        metadata.keywords = Array.from(keywordsSet).sort();
        metadata.mediaTypes = Array.from(mediaTypesSet).sort();
        metadata.ctaTypes = Array.from(ctaTypesSet).filter(c => c).sort();
        metadata.platforms = Array.from(platformsSet).sort();
        metadata.advertisers = Array.from(advertisersMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        metadata.countries = Array.from(countriesSet).sort((a, b) => {
            if (a === 'Global') return 1;
            if (b === 'Global') return -1;
            return a.localeCompare(b);
        });

        metadata.runningDaysRange = { min: minDays === Infinity ? 0 : minDays, max: maxDays };
        metadata.likesRange = { min: minLikes === Infinity ? 0 : minLikes, max: maxLikes };
        metadata.dateRange = { min: minDate, max: maxDate };
    }

    // Get all ads
    function getAllAds() {
        return adsData;
    }

    // Get filtered ads
    function getFilteredAds() {
        return filteredData;
    }

    // Set filtered ads
    function setFilteredAds(data) {
        filteredData = data;
    }

    // Get metadata
    function getMetadata() {
        return metadata;
    }

    // Get ads by advertiser
    function getAdsByAdvertiser(advertiserName) {
        return adsData.filter(ad => ad.advertiser_name === advertiserName);
    }

    // Get ads by keyword
    function getAdsByKeyword(keyword) {
        return adsData.filter(ad => ad.keyword === keyword);
    }

    // Get ads by fingerprint
    function getAdsByFingerprint(fingerprint) {
        return adsData.filter(ad => ad.creative_fingerprint === fingerprint);
    }

    // Get duplicate fingerprints
    function getDuplicateFingerprints(minCount = 2) {
        const fingerprintMap = new Map();

        adsData.forEach(ad => {
            if (ad.creative_fingerprint) {
                const list = fingerprintMap.get(ad.creative_fingerprint) || [];
                list.push(ad);
                fingerprintMap.set(ad.creative_fingerprint, list);
            }
        });

        return Array.from(fingerprintMap.entries())
            .filter(([_, ads]) => ads.length >= minCount)
            .map(([fingerprint, ads]) => ({
                fingerprint,
                count: ads.length,
                ads,
                advertisers: [...new Set(ads.map(a => a.advertiser_name))]
            }))
            .sort((a, b) => b.count - a.count);
    }

    // Get statistics
    function getStatistics() {
        const stats = {
            total: adsData.length,
            viral: adsData.filter(ad => ad.is_viral).length,
            withMedia: adsData.filter(ad => ad.media_urls && ad.media_urls.length > 0).length,
            byMediaType: {},
            byCta: {},
            byKeyword: {},
            byAdvertiser: {}
        };

        adsData.forEach(ad => {
            // Media type
            const mt = ad.media_type || 'unknown';
            stats.byMediaType[mt] = (stats.byMediaType[mt] || 0) + 1;

            // CTA
            const cta = ad.cta_type || 'unknown';
            stats.byCta[cta] = (stats.byCta[cta] || 0) + 1;

            // Keyword
            const kw = ad.keyword || 'unknown';
            stats.byKeyword[kw] = (stats.byKeyword[kw] || 0) + 1;

            // Advertiser
            const adv = ad.advertiser_name || 'unknown';
            stats.byAdvertiser[adv] = (stats.byAdvertiser[adv] || 0) + 1;
        });

        return stats;
    }

    return {
        loadData,
        getAllAds,
        getFilteredAds,
        setFilteredAds,
        getMetadata,
        getAdsByAdvertiser,
        getAdsByKeyword,
        getAdsByFingerprint,
        getDuplicateFingerprints,
        getStatistics
    };
})();
