// Fingerprint Detection Module
const FingerprintModule = (() => {
    // Initialize
    function init() {
        bindEvents();
    }

    // Bind events
    function bindEvents() {
        document.getElementById('detect-fingerprints').addEventListener('click', detectFingerprints);
    }

    // Detect duplicate fingerprints
    function detectFingerprints() {
        const minCount = parseInt(document.getElementById('fingerprint-min').value) || 2;
        const duplicates = DataModule.getDuplicateFingerprints(minCount);

        renderFingerprintResults(duplicates);
    }

    // Render fingerprint detection results
    function renderFingerprintResults(duplicates) {
        const container = document.getElementById('fingerprint-result');

        if (duplicates.length === 0) {
            container.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
                    沒有找到符合條件的重複素材
                </div>
            `;
            return;
        }

        // Summary stats
        const totalGroups = duplicates.length;
        const totalAds = duplicates.reduce((sum, d) => sum + d.count, 0);
        const maxDuplications = duplicates[0].count;
        const multiAdvertiser = duplicates.filter(d => d.advertisers.length > 1).length;

        container.innerHTML = `
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-blue-600">${totalGroups}</div>
                    <div class="text-sm text-gray-500">重複素材組</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-green-600">${totalAds}</div>
                    <div class="text-sm text-gray-500">相關廣告數</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-purple-600">${maxDuplications}</div>
                    <div class="text-sm text-gray-500">最高重複次數</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-orange-600">${multiAdvertiser}</div>
                    <div class="text-sm text-gray-500">跨廣告主使用</div>
                </div>
            </div>

            <!-- Fingerprint Groups -->
            <div class="space-y-4">
                ${duplicates.map((group, idx) => renderFingerprintGroup(group, idx)).join('')}
            </div>
        `;
    }

    // Render single fingerprint group
    function renderFingerprintGroup(group, idx) {
        const isMultiAdvertiser = group.advertisers.length > 1;
        const firstAd = group.ads[0];
        const hasMedia = firstAd.media_urls && firstAd.media_urls.length > 0;

        return `
            <div class="fingerprint-group">
                <div class="fingerprint-group-header">
                    <div class="flex items-center gap-3">
                        <span class="text-lg font-semibold">#${idx + 1}</span>
                        <span class="badge ${isMultiAdvertiser ? 'badge-viral' : 'bg-gray-100 text-gray-600'}">
                            ${group.count} 次重複
                        </span>
                        ${isMultiAdvertiser ? `
                            <span class="badge bg-red-100 text-red-600">
                                跨 ${group.advertisers.length} 個廣告主
                            </span>
                        ` : ''}
                    </div>
                    <button onclick="FingerprintModule.toggleGroup(${idx})"
                            class="text-blue-500 hover:text-blue-700 text-sm" id="toggle-btn-${idx}">
                        展開詳情
                    </button>
                </div>

                <!-- Preview -->
                <div class="flex gap-4">
                    <div class="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        ${hasMedia ?
                            (firstAd.media_type === 'video' ?
                                `<video src="${firstAd.media_urls[0]}" class="w-full h-full object-cover" muted></video>` :
                                `<img src="${firstAd.media_urls[0]}" class="w-full h-full object-cover"
                                      onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-gray-400 text-xs\\'>無預覽</div>'">`)
                            : '<div class="flex items-center justify-center h-full text-gray-400 text-xs">無預覽</div>'
                        }
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-gray-600 line-clamp-2 mb-2">
                            ${escapeHtml(firstAd.ad_text || firstAd.title || '無內容')}
                        </p>
                        <div class="flex flex-wrap gap-2">
                            ${group.advertisers.slice(0, 5).map(name =>
                                `<span class="text-xs px-2 py-1 bg-gray-100 rounded-full">${escapeHtml(truncate(name, 15))}</span>`
                            ).join('')}
                            ${group.advertisers.length > 5 ?
                                `<span class="text-xs px-2 py-1 bg-gray-100 rounded-full">+${group.advertisers.length - 5}</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Detail (hidden by default) -->
                <div id="group-detail-${idx}" class="hidden mt-4 pt-4 border-t border-gray-100">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${group.ads.map(ad => `
                            <div class="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                                 onclick="CardsModule.showAdModal(${JSON.stringify(ad).replace(/"/g, '&quot;')})">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="font-medium text-sm truncate">${escapeHtml(ad.advertiser_name)}</span>
                                    ${ad.is_viral ? '<span class="badge badge-viral text-xs">Viral</span>' : ''}
                                </div>
                                <div class="flex justify-between text-xs text-gray-500">
                                    <span>${ad.running_days || 0} 天</span>
                                    <span>${ad.last_seen}</span>
                                </div>
                                <a href="${ad.ad_url}" target="_blank"
                                   class="text-xs text-blue-500 hover:underline mt-1 block"
                                   onclick="event.stopPropagation()">
                                    查看原廣告
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Toggle group detail
    function toggleGroup(idx) {
        const detail = document.getElementById(`group-detail-${idx}`);
        const btn = document.getElementById(`toggle-btn-${idx}`);

        if (detail.classList.contains('hidden')) {
            detail.classList.remove('hidden');
            btn.textContent = '收起詳情';
        } else {
            detail.classList.add('hidden');
            btn.textContent = '展開詳情';
        }
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
        detectFingerprints,
        toggleGroup
    };
})();
