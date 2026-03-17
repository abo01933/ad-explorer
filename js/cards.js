// Cards Rendering Module
const CardsModule = (() => {
    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;
    let currentSort = { field: 'running_days', order: 'desc' };

    // Intersection Observer for lazy loading media
    let mediaObserver = null;

    function initMediaObserver() {
        if (mediaObserver) mediaObserver.disconnect();
        mediaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const src = el.dataset.lazySrc;
                if (!src) return;

                el.onload = () => el.classList.add('lqip-loaded');
                el.src = src;
                if (el.tagName === 'VIDEO') el.load();
                el.classList.remove('lazy-pending');
                el.removeAttribute('data-lazy-src');
                mediaObserver.unobserve(el);
            });
        }, { rootMargin: '200px' });
    }

    // Render ad cards
    function renderCards() {
        const container = document.getElementById('ads-grid');
        const ads = getSortedAds();

        // Calculate pagination
        const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageAds = ads.slice(startIndex, endIndex);

        // Render cards
        container.innerHTML = '';

        if (pageAds.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <p class="text-lg">沒有符合條件的廣告</p>
                    <p class="text-sm mt-2">請調整篩選條件</p>
                </div>
            `;
            return;
        }

        initMediaObserver();

        pageAds.forEach(ad => {
            const card = createAdCard(ad);
            container.appendChild(card);
        });

        // Attach observer to all lazy media
        container.querySelectorAll('[data-lazy-src]').forEach(el => {
            mediaObserver.observe(el);
        });

        // Render pagination
        renderPagination(totalPages);
        updatePaginationInfo(startIndex + 1, Math.min(endIndex, ads.length), ads.length);
    }

    // Create single ad card
    function createAdCard(ad) {
        const card = document.createElement('div');
        card.className = 'ad-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';

        // Media preview
        const mediaHtml = createMediaPreview(ad);

        // Badges
        const badges = [];
        if (ad.is_viral) badges.push('<span class="badge badge-viral">Viral</span>');
        badges.push(`<span class="badge badge-${ad.media_type || 'unknown'}">${ad.media_type || 'unknown'}</span>`);

        // Format numbers
        const likesFormatted = formatNumber(ad.page_like_count);
        const runningDays = ad.running_days || 0;

        card.innerHTML = `
            <div class="cursor-pointer" onclick="CardsModule.showAdModal(${JSON.stringify(ad).replace(/"/g, '&quot;')})">
                ${mediaHtml}
            </div>
            <div class="p-4">
                <div class="flex items-start justify-between gap-2 mb-2">
                    <h3 class="font-semibold text-blue-600 text-sm line-clamp-1 cursor-pointer hover:text-blue-800 hover:underline"
                        onclick="CardsModule.filterByAdvertiser('${escapeHtml(ad.advertiser_name || '')}')"
                        title="點擊查看此廣告主的所有廣告">
                        ${escapeHtml(ad.advertiser_name || '未知')}
                    </h3>
                    <div class="flex gap-1 flex-shrink-0">${badges.join('')}</div>
                </div>
                <p class="text-xs text-gray-500 line-clamp-2 mb-3 h-8 cursor-pointer"
                   onclick="CardsModule.showAdModal(${JSON.stringify(ad).replace(/"/g, '&quot;')})">
                    ${escapeHtml(ad.ad_text || ad.title || '無內容')}
                </p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span title="運行天數">
                        <svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${runningDays} 天
                    </span>
                    <span title="粉絲數">
                        <svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        ${likesFormatted}
                    </span>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-100">
                    <div class="flex items-center gap-1 flex-wrap">
                        ${ad.keyword ?
                            `<span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">${escapeHtml(ad.keyword)}</span>` :
                            `<span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded">無關鍵字</span>`}
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Filter by advertiser name
    function filterByAdvertiser(advertiserName) {
        if (!advertiserName) return;

        // Set search filter
        document.getElementById('search-input').value = advertiserName;

        // Filter ads by advertiser
        const ads = DataModule.getAllAds().filter(ad =>
            ad.advertiser_name === advertiserName
        );
        DataModule.setFilteredAds(ads);

        // Ensure we're on list view
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'list');
            if (btn.dataset.view === 'list') {
                btn.classList.remove('bg-gray-100', 'text-gray-700');
                btn.classList.add('bg-blue-500', 'text-white');
            } else {
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.add('hidden');
        });
        document.getElementById('list-view').classList.remove('hidden');

        // Render cards
        resetPagination();
        renderCards();
        FiltersModule.updateAdsCount();

        // Close modal if open
        closeModal();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Create media preview HTML (uses data-lazy-src for deferred loading)
    function createMediaPreview(ad) {
        const mediaUrls = ad.media_urls || [];
        const adUrl = ad.ad_url || '#';
        const advertiserName = escapeHtml(ad.advertiser_name || '');

        if (mediaUrls.length === 0) {
            return `
                <div class="media-container bg-gray-100">
                    <div class="placeholder">
                        <svg class="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <p class="text-xs mt-2">無媒體預覽</p>
                    </div>
                </div>
            `;
        }

        const firstUrl = mediaUrls[0];
        const isVideo = ad.media_type === 'video' || firstUrl.includes('.mp4');

        if (isVideo) {
            return `
                <div class="media-container">
                    <video class="lazy-pending" data-lazy-src="${firstUrl}"
                           data-ad-url="${adUrl}" data-advertiser="${advertiserName}"
                           muted preload="none"
                           onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;"
                           onerror="applyMediaFallback(this)">
                    </video>
                    <div class="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
            `;
        }

        const lqip = ad.thumbnail_lqip || '';
        return `
            <div class="media-container">
                <img class="${lqip ? 'lqip-blur' : 'lazy-pending'}"
                     data-lazy-src="${firstUrl}"
                     data-ad-url="${adUrl}" data-advertiser="${advertiserName}"
                     ${lqip ? `src="${lqip}"` : ''}
                     alt="Ad preview" onerror="applyMediaFallback(this)">
                ${mediaUrls.length > 1 ? `
                    <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded px-2 py-0.5 text-white text-xs">
                        +${mediaUrls.length - 1}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Show ad detail modal
    function showAdModal(ad) {
        const modal = document.getElementById('ad-modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');

        // Title with clickable advertiser name
        title.innerHTML = `
            <span class="text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                  onclick="CardsModule.filterByAdvertiser('${escapeHtml(ad.advertiser_name || '')}')">
                ${escapeHtml(ad.advertiser_name || '未知廣告主')}
            </span>
            <span class="text-gray-400 text-sm font-normal ml-2">點擊查看所有廣告</span>
        `;

        // Media gallery
        let mediaGalleryHtml = '';
        if (ad.media_urls && ad.media_urls.length > 0) {
            mediaGalleryHtml = `
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 mb-3">媒體素材</h4>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        ${ad.media_urls.map((url, idx) => {
                            const isVideo = ad.media_type === 'video' || url.includes('.mp4');
                            if (isVideo) {
                                return `
                                    <video src="${url}" controls class="w-full rounded-lg"
                                           onerror="this.outerHTML='<div class=\\'bg-gray-100 rounded-lg p-4 text-center text-gray-500\\'>影片載入失敗</div>'">
                                    </video>
                                `;
                            }
                            return `
                                <img src="${url}" alt="Media ${idx + 1}" class="w-full rounded-lg object-cover"
                                     onerror="this.outerHTML='<div class=\\'bg-gray-100 rounded-lg p-4 text-center text-gray-500\\'>圖片載入失敗</div>'">
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Get advertiser's other ads count
        const advertiserAdsCount = DataModule.getAdsByAdvertiser(ad.advertiser_name).length;

        content.innerHTML = `
            ${mediaGalleryHtml}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">廣告內容</h4>
                    <div class="space-y-2 text-sm">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500">標題：</span>
                            <span class="text-gray-800">${escapeHtml(ad.title || '無')}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500">文案：</span>
                            <p class="text-gray-800 mt-1 whitespace-pre-wrap">${escapeHtml(ad.ad_text || '無')}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <span class="text-gray-500">CTA：</span>
                            <span class="text-gray-800">${ad.cta_text || ad.cta_type || '無'}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">廣告資訊</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">廣告 ID</span>
                            <span class="text-gray-800">${ad.id}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">此廣告主廣告數</span>
                            <span class="text-gray-800">${advertiserAdsCount} 則</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Keyword</span>
                            <span class="text-gray-800">${ad.keyword || '無'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">媒體類型</span>
                            <span class="text-gray-800">${ad.media_type || 'unknown'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">運行天數</span>
                            <span class="text-gray-800 font-medium">${ad.running_days || 0} 天</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">首次出現</span>
                            <span class="text-gray-800">${ad.first_seen || '未知'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">最後出現</span>
                            <span class="text-gray-800">${ad.last_seen || '未知'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">粉絲數</span>
                            <span class="text-gray-800">${formatNumber(ad.page_like_count)}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">病毒式散播</span>
                            <span class="text-gray-800">${ad.is_viral ? '<span class="text-orange-500 font-medium">是</span>' : '否'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">重複次數</span>
                            <span class="text-gray-800">${ad.duplication_count || 1}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <h4 class="font-semibold text-gray-700 mb-3">投放平台</h4>
                <div class="flex flex-wrap gap-2">
                    ${(ad.publisher_platforms || []).map(p =>
                        `<span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">${p}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="mt-6">
                <h4 class="font-semibold text-gray-700 mb-3">Landing Page</h4>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-xs text-gray-500 mb-1">Domain: ${ad.landing_page_domain || '未知'}</div>
                    <a href="${ad.landing_page || '#'}" target="_blank"
                       class="text-blue-500 hover:text-blue-700 text-sm break-all">
                        ${escapeHtml(ad.landing_page || '無')}
                    </a>
                </div>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
                <a href="${ad.ad_url}" target="_blank"
                   class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                    在 Meta Ad Library 查看
                </a>
                <button onclick="CardsModule.filterByAdvertiser('${escapeHtml(ad.advertiser_name || '')}')"
                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    查看此廣告主所有廣告 (${advertiserAdsCount})
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('ad-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 200);
    }

    // Render pagination
    function renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        container.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn bg-white border border-gray-300';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => goToPage(currentPage - 1);
        container.appendChild(prevBtn);

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            addPageButton(container, 1);
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.className = 'px-2 text-gray-400';
                dots.textContent = '...';
                container.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            addPageButton(container, i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'px-2 text-gray-400';
                dots.textContent = '...';
                container.appendChild(dots);
            }
            addPageButton(container, totalPages);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn bg-white border border-gray-300';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => goToPage(currentPage + 1);
        container.appendChild(nextBtn);
    }

    // Add page button
    function addPageButton(container, pageNum) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${pageNum === currentPage ? 'active' : 'bg-white border border-gray-300'}`;
        btn.textContent = pageNum;
        btn.onclick = () => goToPage(pageNum);
        container.appendChild(btn);
    }

    // Go to page
    function goToPage(page) {
        currentPage = page;
        renderCards();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update pagination info
    function updatePaginationInfo(start, end, total) {
        document.getElementById('pagination-info').textContent =
            `顯示 ${start}-${end} 共 ${total} 則`;
    }

    // Get sorted ads
    function getSortedAds() {
        const ads = [...DataModule.getFilteredAds()];

        ads.sort((a, b) => {
            let aVal = a[currentSort.field];
            let bVal = b[currentSort.field];

            // Handle null/undefined
            if (aVal == null) aVal = currentSort.order === 'desc' ? -Infinity : Infinity;
            if (bVal == null) bVal = currentSort.order === 'desc' ? -Infinity : Infinity;

            // Handle dates
            if (currentSort.field.includes('seen')) {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (currentSort.order === 'desc') {
                return bVal - aVal;
            }
            return aVal - bVal;
        });

        return ads;
    }

    // Set sort
    function setSort(field, order) {
        currentSort = { field, order };
        currentPage = 1;
        renderCards();
    }

    // Reset pagination
    function resetPagination() {
        currentPage = 1;
    }

    // Format number
    function formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize sort control
    function initSortControl() {
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => {
            const [field, order] = e.target.value.split('-');
            setSort(field, order);
        });
    }

    // Initialize modal close
    function initModal() {
        document.getElementById('close-modal').addEventListener('click', closeModal);
        document.getElementById('ad-modal').addEventListener('click', (e) => {
            if (e.target.id === 'ad-modal') closeModal();
        });
    }

    return {
        renderCards,
        resetPagination,
        setSort,
        initSortControl,
        initModal,
        formatNumber,
        escapeHtml,
        showAdModal,
        filterByAdvertiser
    };
})();

// Global fallback handler — called via onerror attribute
function applyMediaFallback(el) {
    const adUrl = el.dataset.adUrl || '#';
    const name = el.dataset.advertiser || '素材已過期';
    const container = el.parentElement;
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'placeholder';
    div.innerHTML = `
        <svg class="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-xs text-gray-400 mb-2">${name}</p>
        <a href="${adUrl}" target="_blank" onclick="event.stopPropagation()"
           class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            在 Meta 查看
        </a>
    `;
    el.replaceWith(div);
}
