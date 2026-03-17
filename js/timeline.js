// Timeline Analysis Module
const TimelineModule = (() => {
    let charts = {};

    // Initialize timeline
    function init() {
        bindEvents();
    }

    // Bind events
    function bindEvents() {
        document.getElementById('timeline-granularity')?.addEventListener('change', renderTimeline);
        document.getElementById('timeline-mode')?.addEventListener('change', renderTimeline);
    }

    // Render all timeline charts
    function renderTimeline() {
        renderMainTimeline();
        renderKeywordTimeline();
        renderAdvertiserTimeline();
    }

    // Render main timeline chart
    function renderMainTimeline() {
        const ctx = document.getElementById('timeline-chart');
        if (!ctx) return;

        const granularity = document.getElementById('timeline-granularity')?.value || 'week';
        const mode = document.getElementById('timeline-mode')?.value || 'new';

        const ads = DataModule.getFilteredAds();
        const timeData = aggregateByTime(ads, granularity, mode);

        if (charts.main) charts.main.destroy();

        charts.main = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: timeData.labels,
                datasets: [{
                    label: getModeLabel(mode),
                    data: timeData.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Render keyword timeline chart
    function renderKeywordTimeline() {
        const ctx = document.getElementById('timeline-keyword-chart');
        if (!ctx) return;

        const granularity = document.getElementById('timeline-granularity')?.value || 'week';
        const ads = DataModule.getFilteredAds();

        // Get top 5 keywords
        const keywordCounts = {};
        ads.forEach(ad => {
            if (ad.keyword) {
                keywordCounts[ad.keyword] = (keywordCounts[ad.keyword] || 0) + 1;
            }
        });
        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k]) => k);

        // Get time series for each keyword
        const datasets = topKeywords.map((keyword, idx) => {
            const keywordAds = ads.filter(ad => ad.keyword === keyword);
            const timeData = aggregateByTime(keywordAds, granularity, 'new');
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

            return {
                label: keyword,
                data: timeData.values,
                borderColor: colors[idx],
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 2
            };
        });

        // Get common labels
        const allAdsTimeData = aggregateByTime(ads, granularity, 'new');

        if (charts.keyword) charts.keyword.destroy();

        charts.keyword = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: allAdsTimeData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' }
                    }
                }
            }
        });
    }

    // Render advertiser timeline chart
    function renderAdvertiserTimeline() {
        const ctx = document.getElementById('timeline-advertiser-chart');
        if (!ctx) return;

        const granularity = document.getElementById('timeline-granularity')?.value || 'week';
        const ads = DataModule.getFilteredAds();

        // Get top 5 advertisers
        const advertiserCounts = {};
        ads.forEach(ad => {
            if (ad.advertiser_name) {
                advertiserCounts[ad.advertiser_name] = (advertiserCounts[ad.advertiser_name] || 0) + 1;
            }
        });
        const topAdvertisers = Object.entries(advertiserCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([k]) => k);

        // Get time series for each advertiser
        const datasets = topAdvertisers.map((advertiser, idx) => {
            const advertiserAds = ads.filter(ad => ad.advertiser_name === advertiser);
            const timeData = aggregateByTime(advertiserAds, granularity, 'new');
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

            return {
                label: truncate(advertiser, 15),
                data: timeData.values,
                borderColor: colors[idx],
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 2
            };
        });

        // Get common labels
        const allAdsTimeData = aggregateByTime(ads, granularity, 'new');

        if (charts.advertiser) charts.advertiser.destroy();

        charts.advertiser = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: allAdsTimeData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 10
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' }
                    }
                }
            }
        });
    }

    // Aggregate data by time
    function aggregateByTime(ads, granularity, mode) {
        if (ads.length === 0) {
            return { labels: [], values: [] };
        }

        // Get date range
        const dates = ads.map(ad => new Date(ad.first_seen)).filter(d => !isNaN(d));
        if (dates.length === 0) {
            return { labels: [], values: [] };
        }

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date();

        // Generate time buckets
        const buckets = generateTimeBuckets(minDate, maxDate, granularity);

        // Count ads per bucket
        const counts = new Array(buckets.length).fill(0);

        ads.forEach(ad => {
            const adDate = new Date(ad.first_seen);
            if (isNaN(adDate)) return;

            const bucketIndex = findBucketIndex(adDate, buckets, granularity);
            if (bucketIndex >= 0 && bucketIndex < counts.length) {
                counts[bucketIndex]++;
            }
        });

        // Apply mode transformation
        let values = counts;
        if (mode === 'cumulative') {
            values = [];
            let sum = 0;
            for (const count of counts) {
                sum += count;
                values.push(sum);
            }
        } else if (mode === 'active') {
            // For active mode, count ads that are still running at each time point
            values = buckets.map((bucket, idx) => {
                const bucketDate = bucket.date;
                return ads.filter(ad => {
                    const firstSeen = new Date(ad.first_seen);
                    const lastSeen = new Date(ad.last_seen);
                    return firstSeen <= bucketDate && lastSeen >= bucketDate;
                }).length;
            });
        }

        return {
            labels: buckets.map(b => b.label),
            values: values
        };
    }

    // Generate time buckets
    function generateTimeBuckets(minDate, maxDate, granularity) {
        const buckets = [];
        const current = new Date(minDate);

        // Align to granularity
        if (granularity === 'week') {
            current.setDate(current.getDate() - current.getDay());
        } else if (granularity === 'month') {
            current.setDate(1);
        }

        while (current <= maxDate) {
            const label = formatBucketLabel(current, granularity);
            buckets.push({
                date: new Date(current),
                label: label
            });

            // Advance to next bucket
            if (granularity === 'day') {
                current.setDate(current.getDate() + 1);
            } else if (granularity === 'week') {
                current.setDate(current.getDate() + 7);
            } else if (granularity === 'month') {
                current.setMonth(current.getMonth() + 1);
            }
        }

        return buckets;
    }

    // Find bucket index for a date
    function findBucketIndex(date, buckets, granularity) {
        for (let i = buckets.length - 1; i >= 0; i--) {
            if (date >= buckets[i].date) {
                return i;
            }
        }
        return 0;
    }

    // Format bucket label
    function formatBucketLabel(date, granularity) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        if (granularity === 'day') {
            return `${month}/${day}`;
        } else if (granularity === 'week') {
            return `${month}/${day}`;
        } else if (granularity === 'month') {
            return `${year}/${month}`;
        }
        return `${month}/${day}`;
    }

    // Get mode label
    function getModeLabel(mode) {
        const labels = {
            'new': '新增廣告數',
            'active': '活躍廣告數',
            'cumulative': '累計廣告數'
        };
        return labels[mode] || '廣告數';
    }

    // Truncate text
    function truncate(text, max) {
        if (!text) return '';
        return text.length > max ? text.substring(0, max) + '...' : text;
    }

    return {
        init,
        renderTimeline
    };
})();
