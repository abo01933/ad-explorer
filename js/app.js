// Main Application Entry Point
(async function() {
    // Show loading state
    document.getElementById('ads-grid').innerHTML = `
        <div class="col-span-full flex justify-center py-12">
            <div class="spinner"></div>
        </div>
    `;

    // Load data
    const loaded = await DataModule.loadData();

    if (!loaded) {
        document.getElementById('ads-grid').innerHTML = `
            <div class="col-span-full text-center py-12 text-red-500">
                <p class="text-lg">載入資料失敗</p>
                <p class="text-sm mt-2">請確認 data/ads.json 檔案存在</p>
            </div>
        `;
        return;
    }

    // Initialize modules
    FiltersModule.initFilters();
    CardsModule.initSortControl();
    CardsModule.initModal();
    TimelineModule.init();
    CompareModule.init();
    KeywordGroupModule.init();
    FingerprintModule.init();

    // Apply default filters (exclude generic domains is on by default)
    // This ensures data shows immediately with the default filter applied
    FiltersModule.applyFilters();
    FiltersModule.updateAdsCount();

    // View switching
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Compare mode switching
    document.querySelectorAll('.compare-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.compareMode;
            switchCompareMode(mode);
        });
    });

    // Switch main view
    function switchView(view) {
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
            if (btn.dataset.view === view) {
                btn.classList.remove('bg-gray-100', 'text-gray-700');
                btn.classList.add('bg-blue-500', 'text-white');
            } else {
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });

        // Show/hide views
        document.querySelectorAll('.view-content').forEach(v => {
            v.classList.add('hidden');
        });
        document.getElementById(`${view}-view`).classList.remove('hidden');

        // Initialize charts if needed
        if (view === 'charts') {
            ChartsModule.initCharts();
        }

        // Initialize timeline if needed
        if (view === 'timeline') {
            TimelineModule.renderTimeline();
        }
    }

    // Switch compare mode
    function switchCompareMode(mode) {
        // Update button states
        document.querySelectorAll('.compare-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.compareMode === mode);
            if (btn.dataset.compareMode === mode) {
                btn.classList.remove('bg-gray-100', 'text-gray-700');
                btn.classList.add('bg-blue-500', 'text-white');
            } else {
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });

        // Show/hide compare contents
        document.querySelectorAll('.compare-content').forEach(c => {
            c.classList.add('hidden');
        });

        if (mode === 'manual') {
            document.getElementById('manual-compare').classList.remove('hidden');
        } else if (mode === 'keyword') {
            document.getElementById('keyword-compare').classList.remove('hidden');
        } else if (mode === 'fingerprint') {
            document.getElementById('fingerprint-compare').classList.remove('hidden');
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('ad-modal');
            if (!modal.classList.contains('hidden')) {
                modal.classList.remove('show');
                setTimeout(() => modal.classList.add('hidden'), 200);
            }
        }

        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });

    console.log('Ad Explorer initialized successfully!');
    console.log(`Loaded ${DataModule.getAllAds().length} ads from ${DataModule.getMetadata().advertisers.length} advertisers`);
})();
