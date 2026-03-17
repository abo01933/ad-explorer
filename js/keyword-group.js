// Keyword Group Module
const KeywordGroupModule = (() => {
    let selectedKeyword = null;

    // Initialize
    function init() {
        renderKeywordButtons();
    }

    // Render keyword selection buttons
    function renderKeywordButtons() {
        const container = document.getElementById('keyword-group-buttons');
        const metadata = DataModule.getMetadata();

        const keywordColors = {
            'Slot': '#ef4444',
            'Casino': '#f59e0b',
            'Jackpot': '#10b981',
            'Big Win': '#3b82f6',
            'Free Coins': '#8b5cf6',
            '777': '#ec4899'
        };

        container.innerHTML = metadata.keywords.map(kw => {
            const color = keywordColors[kw] || '#6b7280';
            const stats = DataModule.getStatistics();
            const count = stats.byKeyword[kw] || 0;

            return `
                <button class="keyword-btn ${selectedKeyword === kw ? 'active' : ''}"
                        data-keyword="${escapeHtml(kw)}"
                        style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}40;">
                    ${escapeHtml(kw)}
                    <span class="ml-1 opacity-70">(${count})</span>
                </button>
            `;
        }).join('');

        // Bind click events
        container.querySelectorAll('.keyword-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const keyword = btn.dataset.keyword;
                selectKeyword(keyword);
            });
        });
    }

    // Select keyword and show group analysis
    function selectKeyword(keyword) {
        selectedKeyword = keyword;

        // Update button states
        document.querySelectorAll('.keyword-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.keyword === keyword);
        });

        renderKeywordGroupResult();
    }

    // Render keyword group analysis result
    function renderKeywordGroupResult() {
        const container = document.getElementById('keyword-group-result');
        const ads = DataModule.getAdsByKeyword(selectedKeyword);

        // Group by advertiser
        const advertiserMap = new Map();
        ads.forEach(ad => {
            const name = ad.advertiser_name;
            if (!advertiserMap.has(name)) {
                advertiserMap.set(name, []);
            }
            advertiserMap.get(name).push(ad);
        });

        // Sort by ad count
        const advertisers = Array.from(advertiserMap.entries())
            .map(([name, ads]) => ({
                name,
                ads,
                count: ads.length,
                avgRunningDays: ads.reduce((sum, ad) => sum + (ad.running_days || 0), 0) / ads.length,
                viralCount: ads.filter(ad => ad.is_viral).length,
                totalLikes: ads[0]?.page_like_count || 0
            }))
            .sort((a, b) => b.count - a.count);

        // Calculate stats
        const totalAds = ads.length;
        const totalAdvertisers = advertisers.length;
        const avgAdsPerAdvertiser = totalAds / totalAdvertisers || 0;
        const totalViral = ads.filter(ad => ad.is_viral).length;

        container.innerHTML = `
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-blue-600">${totalAds}</div>
                    <div class="text-sm text-gray-500">總廣告數</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-green-600">${totalAdvertisers}</div>
                    <div class="text-sm text-gray-500">廣告主數</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-purple-600">${avgAdsPerAdvertiser.toFixed(1)}</div>
                    <div class="text-sm text-gray-500">平均廣告數/廣告主</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-orange-600">${totalViral}</div>
                    <div class="text-sm text-gray-500">Viral 廣告</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Advertiser Ranking -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="text-lg font-semibold mb-4">廣告主排名（依廣告數）</h3>
                    <div class="h-80">
                        <canvas id="keyword-advertisers-chart"></canvas>
                    </div>
                </div>

                <!-- Media Type Distribution -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="text-lg font-semibold mb-4">媒體類型分佈</h3>
                    <div class="h-80">
                        <canvas id="keyword-media-chart"></canvas>
                    </div>
                </div>

                <!-- Advertiser List -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <h3 class="text-lg font-semibold mb-4">所有廣告主列表</h3>
                    <div class="overflow-x-auto">
                        <table class="compare-table">
                            <thead>
                                <tr>
                                    <th>排名</th>
                                    <th>廣告主</th>
                                    <th>廣告數</th>
                                    <th>平均運行天數</th>
                                    <th>Viral</th>
                                    <th>粉絲數</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${advertisers.slice(0, 20).map((adv, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td class="font-medium">${escapeHtml(adv.name)}</td>
                                        <td>${adv.count}</td>
                                        <td>${adv.avgRunningDays.toFixed(1)} 天</td>
                                        <td>${adv.viralCount > 0 ? `<span class="badge badge-viral">${adv.viralCount}</span>` : '-'}</td>
                                        <td>${CardsModule.formatNumber(adv.totalLikes)}</td>
                                        <td>
                                            <button onclick="KeywordGroupModule.viewAdvertiserAds('${escapeHtml(adv.name)}')"
                                                    class="text-blue-500 hover:text-blue-700 text-sm">
                                                查看廣告
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${advertisers.length > 20 ? `
                            <p class="text-center text-sm text-gray-500 mt-4">
                                還有 ${advertisers.length - 20} 個廣告主...
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Render charts
        renderKeywordCharts(advertisers, ads);
    }

    // Render charts for keyword group
    function renderKeywordCharts(advertisers, ads) {
        const colors = ChartsModule.getColors(10);

        // Top advertisers chart
        const top10 = advertisers.slice(0, 10);
        new Chart(document.getElementById('keyword-advertisers-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: top10.map(a => truncate(a.name, 12)),
                datasets: [{
                    label: '廣告數',
                    data: top10.map(a => a.count),
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });

        // Media type chart
        const mediaTypes = {};
        ads.forEach(ad => {
            const type = ad.media_type || 'unknown';
            mediaTypes[type] = (mediaTypes[type] || 0) + 1;
        });

        new Chart(document.getElementById('keyword-media-chart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(mediaTypes),
                datasets: [{
                    data: Object.values(mediaTypes),
                    backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // View advertiser's ads (switch to list view with filter)
    function viewAdvertiserAds(advertiserName) {
        // Set search filter
        document.getElementById('search-input').value = advertiserName;

        // Trigger filter
        const ads = DataModule.getAllAds().filter(ad =>
            ad.advertiser_name === advertiserName
        );
        DataModule.setFilteredAds(ads);

        // Switch to list view
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'list');
        });
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.add('hidden');
        });
        document.getElementById('list-view').classList.remove('hidden');

        // Render cards
        CardsModule.resetPagination();
        CardsModule.renderCards();
        FiltersModule.updateAdsCount();
    }

    // Helper: truncate
    function truncate(text, max) {
        if (!text) return '';
        return text.length > max ? text.substring(0, max) + '...' : text;
    }

    // Helper: escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init,
        selectKeyword,
        viewAdvertiserAds
    };
})();
