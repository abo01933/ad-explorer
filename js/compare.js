// Manual Compare Module
const CompareModule = (() => {
    let selectedAdvertisers = [];
    let advertiserSearchTimeout;

    // Initialize compare module
    function init() {
        renderAdvertiserList();
        bindEvents();
    }

    // Render advertiser list for selection
    function renderAdvertiserList(filter = '') {
        const container = document.getElementById('advertiser-list');
        const metadata = DataModule.getMetadata();

        let advertisers = metadata.advertisers;
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            advertisers = advertisers.filter(a =>
                a.name.toLowerCase().includes(lowerFilter)
            );
        }

        container.innerHTML = advertisers.slice(0, 50).map(adv => `
            <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
                selectedAdvertisers.includes(adv.name) ? 'bg-blue-50' : ''
            }">
                <input type="checkbox" value="${escapeHtml(adv.name)}"
                       ${selectedAdvertisers.includes(adv.name) ? 'checked' : ''}
                       ${selectedAdvertisers.length >= 5 && !selectedAdvertisers.includes(adv.name) ? 'disabled' : ''}
                       class="advertiser-checkbox w-4 h-4 text-blue-500 rounded">
                <span class="text-sm truncate flex-1">${escapeHtml(adv.name)}</span>
                <span class="text-xs text-gray-400">${adv.count}</span>
            </label>
        `).join('');

        // Rebind checkbox events
        container.querySelectorAll('.advertiser-checkbox').forEach(cb => {
            cb.addEventListener('change', handleAdvertiserSelect);
        });
    }

    // Handle advertiser selection
    function handleAdvertiserSelect(e) {
        const name = e.target.value;

        if (e.target.checked) {
            if (selectedAdvertisers.length < 5) {
                selectedAdvertisers.push(name);
            } else {
                e.target.checked = false;
                return;
            }
        } else {
            selectedAdvertisers = selectedAdvertisers.filter(a => a !== name);
        }

        updateSelectedTags();
        renderAdvertiserList(document.getElementById('advertiser-search').value);

        if (selectedAdvertisers.length >= 2) {
            renderCompareResult();
        } else {
            document.getElementById('compare-result').innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    請選擇至少 2 個廣告主進行比較
                </div>
            `;
        }
    }

    // Update selected advertiser tags
    function updateSelectedTags() {
        const container = document.getElementById('selected-advertisers');
        container.innerHTML = selectedAdvertisers.map(name => `
            <span class="advertiser-tag">
                ${escapeHtml(name)}
                <button onclick="CompareModule.removeAdvertiser('${escapeHtml(name)}')">&times;</button>
            </span>
        `).join('');
    }

    // Remove advertiser from selection
    function removeAdvertiser(name) {
        selectedAdvertisers = selectedAdvertisers.filter(a => a !== name);
        updateSelectedTags();
        renderAdvertiserList(document.getElementById('advertiser-search').value);

        if (selectedAdvertisers.length >= 2) {
            renderCompareResult();
        } else {
            document.getElementById('compare-result').innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    請選擇至少 2 個廣告主進行比較
                </div>
            `;
        }
    }

    // Render comparison results
    function renderCompareResult() {
        const container = document.getElementById('compare-result');

        // Get ads for each advertiser
        const advertiserData = selectedAdvertisers.map(name => {
            const ads = DataModule.getAdsByAdvertiser(name);
            return {
                name,
                ads,
                count: ads.length,
                avgRunningDays: ads.reduce((sum, ad) => sum + (ad.running_days || 0), 0) / ads.length || 0,
                viralCount: ads.filter(ad => ad.is_viral).length,
                mediaTypes: countByField(ads, 'media_type'),
                ctaTypes: countByField(ads, 'cta_type'),
                platforms: countPlatforms(ads),
                totalLikes: ads[0]?.page_like_count || 0
            };
        });

        container.innerHTML = `
            <!-- Summary Table -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                <h3 class="text-lg font-semibold mb-4">比較摘要</h3>
                <div class="overflow-x-auto">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th>指標</th>
                                ${advertiserData.map(a => `<th>${escapeHtml(truncate(a.name, 15))}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>廣告數量</td>
                                ${advertiserData.map(a => `<td><strong>${a.count}</strong></td>`).join('')}
                            </tr>
                            <tr>
                                <td>平均運行天數</td>
                                ${advertiserData.map(a => `<td>${a.avgRunningDays.toFixed(1)} 天</td>`).join('')}
                            </tr>
                            <tr>
                                <td>Viral 廣告</td>
                                ${advertiserData.map(a => `<td>${a.viralCount}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>粉絲數</td>
                                ${advertiserData.map(a => `<td>${CardsModule.formatNumber(a.totalLikes)}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>主要媒體類型</td>
                                ${advertiserData.map(a => {
                                    const top = Object.entries(a.mediaTypes).sort((x, y) => y[1] - x[1])[0];
                                    return `<td>${top ? top[0] : '-'}</td>`;
                                }).join('')}
                            </tr>
                            <tr>
                                <td>主要 CTA</td>
                                ${advertiserData.map(a => {
                                    const top = Object.entries(a.ctaTypes).sort((x, y) => y[1] - x[1])[0];
                                    return `<td>${top ? FiltersModule.formatCtaType(top[0]) : '-'}</td>`;
                                }).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Ad Count Chart -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 class="text-lg font-semibold mb-4">廣告數量比較</h3>
                <div class="h-64">
                    <canvas id="compare-count-chart"></canvas>
                </div>
            </div>

            <!-- Running Days Chart -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 class="text-lg font-semibold mb-4">平均運行天數</h3>
                <div class="h-64">
                    <canvas id="compare-days-chart"></canvas>
                </div>
            </div>

            <!-- Media Type Distribution -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                <h3 class="text-lg font-semibold mb-4">媒體類型分佈</h3>
                <div class="h-64">
                    <canvas id="compare-media-chart"></canvas>
                </div>
            </div>

            <!-- Recent Ads Grid -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                <h3 class="text-lg font-semibold mb-4">各廣告主最新廣告</h3>
                <div class="grid grid-cols-1 md:grid-cols-${Math.min(selectedAdvertisers.length, 3)} gap-4">
                    ${advertiserData.map(a => {
                        const latestAd = a.ads.sort((x, y) =>
                            new Date(y.last_seen) - new Date(x.last_seen)
                        )[0];
                        if (!latestAd) return '';
                        return `
                            <div class="border border-gray-200 rounded-lg p-4">
                                <h4 class="font-medium text-sm mb-2 truncate">${escapeHtml(a.name)}</h4>
                                <div class="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                    ${latestAd.media_urls && latestAd.media_urls[0] ?
                                        `<img src="${latestAd.media_urls[0]}" class="w-full h-full object-cover"
                                              onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-gray-400\\'>無預覽</div>'">`
                                        : '<div class="flex items-center justify-center h-full text-gray-400">無預覽</div>'
                                    }
                                </div>
                                <p class="text-xs text-gray-500 line-clamp-2">${escapeHtml(latestAd.ad_text || latestAd.title || '無內容')}</p>
                                <div class="flex justify-between mt-2 text-xs text-gray-400">
                                    <span>${latestAd.running_days || 0} 天</span>
                                    <span>${latestAd.last_seen}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Render comparison charts
        renderCompareCharts(advertiserData);
    }

    // Render comparison charts
    function renderCompareCharts(advertiserData) {
        const colors = ChartsModule.getColors(advertiserData.length);

        // Ad count chart
        new Chart(document.getElementById('compare-count-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: advertiserData.map(a => truncate(a.name, 10)),
                datasets: [{
                    label: '廣告數量',
                    data: advertiserData.map(a => a.count),
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Running days chart
        new Chart(document.getElementById('compare-days-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: advertiserData.map(a => truncate(a.name, 10)),
                datasets: [{
                    label: '平均運行天數',
                    data: advertiserData.map(a => a.avgRunningDays.toFixed(1)),
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Media type chart (stacked)
        const mediaTypes = ['video', 'image', 'carousel', 'unknown'];
        new Chart(document.getElementById('compare-media-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: advertiserData.map(a => truncate(a.name, 10)),
                datasets: mediaTypes.map((type, idx) => ({
                    label: type,
                    data: advertiserData.map(a => a.mediaTypes[type] || 0),
                    backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#6b7280'][idx]
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    }

    // Bind events
    function bindEvents() {
        const searchInput = document.getElementById('advertiser-search');
        searchInput.addEventListener('input', (e) => {
            clearTimeout(advertiserSearchTimeout);
            advertiserSearchTimeout = setTimeout(() => {
                renderAdvertiserList(e.target.value);
            }, 300);
        });
    }

    // Helper: count by field
    function countByField(ads, field) {
        const counts = {};
        ads.forEach(ad => {
            const value = ad[field] || 'unknown';
            counts[value] = (counts[value] || 0) + 1;
        });
        return counts;
    }

    // Helper: count platforms
    function countPlatforms(ads) {
        const counts = {};
        ads.forEach(ad => {
            (ad.publisher_platforms || []).forEach(p => {
                counts[p] = (counts[p] || 0) + 1;
            });
        });
        return counts;
    }

    // Helper: truncate text
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

    // Get selected advertisers
    function getSelectedAdvertisers() {
        return [...selectedAdvertisers];
    }

    // Clear selection
    function clearSelection() {
        selectedAdvertisers = [];
        updateSelectedTags();
        renderAdvertiserList();
        document.getElementById('compare-result').innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                請選擇至少 2 個廣告主進行比較
            </div>
        `;
    }

    return {
        init,
        removeAdvertiser,
        getSelectedAdvertisers,
        clearSelection
    };
})();
