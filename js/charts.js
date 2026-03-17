// Charts Module
const ChartsModule = (() => {
    let charts = {};

    // Color palettes
    const COLORS = {
        primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
        rainbow: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
        pastel: ['#fecaca', '#fed7aa', '#d9f99d', '#a5f3fc', '#c4b5fd', '#fbcfe8', '#99f6e4', '#fde68a']
    };

    // Initialize all charts
    function initCharts() {
        renderMediaTypeChart();
        renderCtaChart();
        renderKeywordChart();
        renderRunningDaysChart();
        renderTopAdvertisersChart();
    }

    // Render media type distribution chart
    function renderMediaTypeChart() {
        const ctx = document.getElementById('media-type-chart').getContext('2d');
        const stats = DataModule.getStatistics();

        const labels = Object.keys(stats.byMediaType);
        const data = Object.values(stats.byMediaType);

        if (charts.mediaType) charts.mediaType.destroy();

        charts.mediaType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: data,
                    backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render CTA type distribution chart
    function renderCtaChart() {
        const ctx = document.getElementById('cta-chart').getContext('2d');
        const stats = DataModule.getStatistics();

        // Get top 8 CTA types
        const sorted = Object.entries(stats.byCta)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        const labels = sorted.map(([k]) => FiltersModule.formatCtaType(k));
        const data = sorted.map(([, v]) => v);

        if (charts.cta) charts.cta.destroy();

        charts.cta = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '廣告數量',
                    data: data,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Render keyword distribution chart
    function renderKeywordChart() {
        const ctx = document.getElementById('keyword-chart').getContext('2d');
        const stats = DataModule.getStatistics();

        const sorted = Object.entries(stats.byKeyword)
            .sort((a, b) => b[1] - a[1]);

        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v);

        if (charts.keyword) charts.keyword.destroy();

        charts.keyword = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: COLORS.rainbow,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render running days distribution chart
    function renderRunningDaysChart() {
        const ctx = document.getElementById('running-days-chart').getContext('2d');
        const ads = DataModule.getAllAds();

        // Create histogram bins
        const bins = [
            { label: '1-7 天', min: 1, max: 7 },
            { label: '8-30 天', min: 8, max: 30 },
            { label: '31-90 天', min: 31, max: 90 },
            { label: '91-180 天', min: 91, max: 180 },
            { label: '181-365 天', min: 181, max: 365 },
            { label: '365+ 天', min: 366, max: Infinity }
        ];

        const data = bins.map(bin => {
            return ads.filter(ad => {
                const days = ad.running_days || 0;
                return days >= bin.min && days <= bin.max;
            }).length;
        });

        if (charts.runningDays) charts.runningDays.destroy();

        charts.runningDays = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bins.map(b => b.label),
                datasets: [{
                    label: '廣告數量',
                    data: data,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
                }
            }
        });
    }

    // Render top advertisers chart
    function renderTopAdvertisersChart() {
        const ctx = document.getElementById('top-advertisers-chart').getContext('2d');
        const metadata = DataModule.getMetadata();

        // Get top 20 advertisers
        const top20 = metadata.advertisers.slice(0, 20);

        const labels = top20.map(a => truncateText(a.name, 20));
        const data = top20.map(a => a.count);

        if (charts.topAdvertisers) charts.topAdvertisers.destroy();

        charts.topAdvertisers = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '廣告數量',
                    data: data,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 4
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
                        callbacks: {
                            title: function(context) {
                                return top20[context[0].dataIndex].name;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        }
                    }
                }
            }
        });
    }

    // Truncate text
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Create comparison chart
    function createComparisonChart(canvasId, type, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        return new Chart(ctx.getContext('2d'), {
            type: type,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
    }

    // Get chart colors
    function getColors(count) {
        const colors = [...COLORS.rainbow];
        while (colors.length < count) {
            colors.push(...COLORS.rainbow);
        }
        return colors.slice(0, count);
    }

    return {
        initCharts,
        createComparisonChart,
        getColors,
        COLORS
    };
})();
