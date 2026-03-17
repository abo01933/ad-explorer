// Filters Module
const FiltersModule = (() => {
  let currentFilters = {
    search: "",
    keywords: [],
    mediaType: "",
    platforms: [],
    domains: [],
    excludeGenericDomains: true,
    excludeGoDomains: false,
    excludeNonGambling: false,
    country: "",
  };

  // Keyword translations (local language -> English)
  const keywordTranslations = {
    স্লট: "Slot",
    ক্যাসিনো: "Casino",
    জ্যাকপট: "Jackpot",
    "বড় জয়": "Big Win",
    "ফ্রি কয়েন": "Free Coins",
  };

  // Country display labels
  const countryLabels = {
    BD: "Bangladesh",
    TH: "Thailand",
    BR: "Brazil",
    IN: "India",
    Global: "Global / Other",
  };

  // Generic domains to exclude
  const genericDomains = [
    "play.google.com",
    "apps.apple.com",
    "itunes.apple.com",
    "app.appsflyer.com",
    "go.onelink.me",
    "l.facebook.com",
    "fb.gg",
    "fb.com",
    "fb.me",
    "www.facebook.com",
    "api.whatsapp.com",
  ];

  // Non-gambling advertisers to exclude (verified by keyword analysis)
  // Excludes disposable "online shop" names used as gambling disguises
  const nonGamblingAdvertisers = [
    "AB Fashion- এবি ফ্যাশন",
    "Adarsha Furniture Badda",
    "All Things Home Appliances",
    "Amanot Foods",
    "Apple Gadgets",
    "Arabian Food Service",
    "Badda Furniture Mart",
    "Barakah Nur Fashion",
    "Barbara K. Martinez",
    "Bike Driver Hiring - Kolkata",
    "Bike Rider Hiring Point",
    "CIFF - China International Furniture Fair",
    "Center Furniture",
    "Cliffs- Your Visa Navigator",
    "DramaBox JP",
    "DramaBox- drama movies2",
    "DramaBox- drama movies5",
    "DramaBox- drama movies6",
    "DramaBox- drama movies99",
    "DramaBox- movies",
    "DramaBox- movies and drama",
    "DramaBox-fresh drama&movies",
    "DramaBox-movies and drama 8",
    "Dramawave-New short dramas",
    "Dramawave-vip",
    "Gadget Agro World",
    "Gadget Corner",
    "HR MART",
    "Hello reading S",
    "Home & Gadget Paradise",
    "Homemade food for babies by Jafrin",
    "Jhilik Furniture",
    "Juboraj Furniture",
    "Kajol Furniture",
    "Kanchpur Furniture BD",
    "Kashful Furniture",
    "Life Coaching Kit Pro",
    "Live View Furniture",
    "MB Furniture & Door",
    "Maa Babar Dowa Furniture",
    "Marvel Fashion",
    "Mindfulness Coaching Kit",
    "Must-Watch Drama Shorts",
    "Nabil Nishat Woodpecker Furniture",
    "Natural Foods Service",
    "Natural Furniture .",
    "New World Furniture.BD",
    "Nobonir Furniture",
    "Optilux BD Fashion",
    "Plant Food Fertilizer",
    "Pop Video & Drama Player",
    "RN Furniture & Mattress",
    "Rashed Furniture",
    "Series Lounge",
    "Short Drama Channel",
    "Short Drama-love",
    "SnapDrama23",
    "The Appliance Expert",
    "The Ordinary Mart",
    "Vigu book",
    "Zahraa Fashion",
    "foodpanda riders",
    "চুইঝাল - m3Food",
    "বিশুদ্ধ ফুডস Bishuddhofoods",
  ];

  // Gambling domains whitelist (always keep these even if they match non-gambling patterns)
  const gamblingWhitelist = ["cdggtlh352.e9bc.xyz", "volcan.playqoogle.site"];

  // Non-gambling domains to exclude (content streaming, readers)
  const nonGamblingDomains = [
    "fb.netshort.com",
    "fbweb.moboreader.com",
    "youku.pw",
    "heriken.com",
    "bhpz.adj.st", // Ice cream ads
    "offer.optiluxs.com", // Fashion/shopping
    "www.mindfulnesscoachingkit.pro",
    "wgwtech.com",
    "instagram.com",
    "rukiyasifa.com",
    "safialsunnah.com",
    "kalshobdo.com",
    "link.onesyep.com",
    "myqweasdzxc.com",
    "pages.farsunpteltd.com",
    "forms.gle",
    "bdframe.xyz",
    "m3food.com",
    "www.instagram.com",
    "fandiem.com",
    "minicrafts.co",
    "agamonibagansomadhan.com",
    "mindfuelbd.com",
    "Labenza.com",
    "divinesouvinir.com",
    "mybl.go.link",
    "brgbook.com",
    "yourarie.com",
    "viral-strategies.com",
    "uniquefootwears.com",
    "supremefoodbd.com",
    "fundirect.one",
    "adsflow.io",
    "www.fb.com",
    "hffoodservice.com",
    "fb.netshort.com",
  ];

  // Non-gambling domain patterns (keywords to match in domains)
  const nonGamblingDomainPatterns = [
    "daraz",
    "bkash",
    "nagad",
    "agoda",
    "skyscanner",
    "booking.com",
    "bank",
    "edu",
    "visa",
    "university",
    "islamic",
    "muslim",
    "bible",
    "course",
    "training",
    "novel",
    "drama",
    "story",
    "reading",
    "chapter",
    "episode",
    "template",
    "planner",
    "journal",
    "plr",
    "resell",
    "gadget",
    "apple",
    "iphone",
    "samsung",
    "flight",
    "ticket",
    "hajj",
    "umrah",
    "travel",
    "insurance",
    "loan",
    "credit",
    "warthunder",
    "steam",
    "epicgames",
    "nintendo",
    "matrimony",
    "property",
    "realestate",
    "zillow",
    "astrology",
    "horoscope",
    "job",
    "hiring",
    "recruitment",
    "leather",
    "family",
    "product",
    "optiluxbd",
    "study",
  ];

  // Non-gambling advertiser name patterns (keywords to match in advertiser names)
  const nonGamblingAdvertiserPatterns = [
    "Bank",
    "Foundation",
    "University",
    "Institute",
    "Travels",
    "Tours",
    "Ministry",
    "Shop",
    "Store",
    "Drama",
    "Novel",
    "Reading",
    "Studio",
    "Production",
    "Channel",
    "Coaching",
    "Workshop",
    "Academy",
    "School",
    "Mindfulness",
    "Yoga",
    "Digital",
    "Marketing",
    "Agency",
    "Solutions",
    "Software",
    "Church",
    "Temple",
    "Mosque",
    "Islamic",
    "Mission",
    "Charity",
    "Apple",
    "Microsoft",
    "Amazon",
    "Netflix",
    "Disney",
    "Consultancy",
    "Immigration",
    "Matrimonial",
    "Wedding",
    "Clinic",
    "Hospital",
    "Physio",
    "Furniture",
    "study",
  ];

  // Helper function to check if text contains any non-gambling patterns
  function containsNonGamblingPattern(text, patterns) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return patterns.some((pattern) =>
      lowerText.includes(pattern.toLowerCase())
    );
  }

  // Initialize filter UI
  function initFilters() {
    const metadata = DataModule.getMetadata();

    // Keyword filters (with translations)
    renderKeywordFilters(metadata.keywords);

    // Media type dropdown
    renderMediaTypeDropdown(metadata.mediaTypes);

    // Country dropdown
    renderCountryDropdown();

    // Domain filters
    renderDomainFilters();

    // Set default exclude generic domains
    const excludeGenericEl = document.getElementById("exclude-generic");
    if (excludeGenericEl) {
      excludeGenericEl.checked = true;
    }

    // Bind events
    bindFilterEvents();

    // Initial filter counts
    updateFilterCounts();
  }

  // Render media type dropdown
  function renderMediaTypeDropdown(mediaTypes) {
    const select = document.getElementById("media-type-filter");
    if (!select) return;

    // Clear existing options except the first "全部"
    select.innerHTML = '<option value="">全部</option>';

    mediaTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
  }

  // Render country dropdown with per-country ad counts
  function renderCountryDropdown() {
    const select = document.getElementById("country-filter");
    if (!select) return;

    const metadata = DataModule.getMetadata();
    const allAds = DataModule.getAllAds();

    select.innerHTML = '<option value="">全部國家</option>';

    metadata.countries.forEach((country) => {
      const count = allAds.filter((ad) => ad.country === country).length;
      const option = document.createElement("option");
      option.value = country;
      option.textContent = `${countryLabels[country] || country} (${count})`;
      select.appendChild(option);
    });
  }

  // Render keyword filters with translations
  function renderKeywordFilters(keywords) {
    const container = document.getElementById("keyword-filters");
    container.innerHTML = "";

    keywords.forEach((keyword) => {
      const label = document.createElement("label");
      label.className = "filter-checkbox";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = keyword;
      checkbox.dataset.filterType = "keyword";

      const span = document.createElement("span");
      span.className = "text-sm text-gray-700";

      // Add translation if available
      const translation = keywordTranslations[keyword];
      if (translation) {
        span.textContent = `${keyword} (${translation})`;
      } else {
        span.textContent = keyword;
      }

      // Add count
      const countSpan = document.createElement("span");
      countSpan.className = "filter-count text-xs text-gray-400 ml-1";
      countSpan.dataset.filterType = "keyword";
      countSpan.dataset.value = keyword;

      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(countSpan);
      container.appendChild(label);
    });
  }

  // Render checkbox group (no colors)
  function renderCheckboxGroup(containerId, items, prefix) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    items.forEach((item) => {
      const label = document.createElement("label");
      label.className = "filter-checkbox";
      label.dataset.value = item;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item;
      checkbox.dataset.filterType = prefix;

      const span = document.createElement("span");
      span.className = "text-sm text-gray-700";
      span.textContent = prefix === "platform" ? item.toLowerCase() : item;

      // Add count badge
      const countSpan = document.createElement("span");
      countSpan.className = "filter-count text-xs text-gray-400 ml-1";
      countSpan.dataset.filterType = prefix;
      countSpan.dataset.value = item;

      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(countSpan);
      container.appendChild(label);
    });
  }

  // Render domain filters
  function renderDomainFilters() {
    const container = document.getElementById("domain-filters");
    if (!container) return;

    // Get unique domains from data
    const allAds = DataModule.getAllAds();
    const domainCounts = {};
    allAds.forEach((ad) => {
      const domain = ad.landing_page_domain;
      const landingPage = ad.landing_page || "";

      // Exclude generic domains, go. domains, and non-gambling domains
      if (
        domain &&
        !genericDomains.includes(domain) &&
        !nonGamblingDomains.includes(domain) &&
        !containsNonGamblingPattern(domain, nonGamblingDomainPatterns) &&
        !containsNonGamblingPattern(landingPage, nonGamblingDomainPatterns) &&
        !landingPage.startsWith("https://go.")
      ) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });

    // Sort by count and take top 80
    const sortedDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 80);

    container.innerHTML = "";

    // Add domain checkboxes
    sortedDomains.forEach(([domain, count]) => {
      const label = createDomainCheckbox(domain, count);
      container.appendChild(label);
    });

    if (sortedDomains.length === 0) {
      const noData = document.createElement("div");
      noData.className = "text-xs text-gray-400";
      noData.textContent = "無 Domain";
      container.appendChild(noData);
    }
  }

  // Create domain checkbox
  function createDomainCheckbox(domain, count) {
    const label = document.createElement("label");
    label.className = "filter-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = domain;
    checkbox.dataset.filterType = "domain";

    const span = document.createElement("span");
    span.className = "text-sm text-gray-700 truncate flex-1";
    span.textContent = domain;
    span.title = domain;

    const countSpan = document.createElement("span");
    countSpan.className = "text-xs text-gray-400 ml-1";
    countSpan.textContent = `(${count})`;

    label.appendChild(checkbox);
    label.appendChild(span);
    label.appendChild(countSpan);

    return label;
  }

  // Update filter counts based on current selection
  function updateFilterCounts() {
    const baseFilteredAds = getBaseFilteredAds();

    // Update keyword counts
    updateKeywordCounts(baseFilteredAds);

    // Update platform counts
    updatePlatformCounts(baseFilteredAds);
  }

  // Update keyword counts
  function updateKeywordCounts(ads) {
    const counts = {};
    ads.forEach((ad) => {
      if (ad.keyword) counts[ad.keyword] = (counts[ad.keyword] || 0) + 1;
    });

    document.querySelectorAll('[data-filter-type="keyword"]').forEach((el) => {
      if (el.tagName === "INPUT") {
        const label = el.closest("label");
        const countSpan = label?.querySelector(".filter-count");
        const value = el.value;

        // For keywords, count from all ads (not filtered)
        const allAds = DataModule.getAllAds();
        let count = 0;
        allAds.forEach((ad) => {
          if (ad.keyword === value) count++;
        });

        if (countSpan) {
          countSpan.textContent = `(${count})`;
        }
      }
    });
  }

  // Update checkbox counts
  function updateCheckboxCounts(filterType, ads, field) {
    const counts = {};
    ads.forEach((ad) => {
      const value = ad[field];
      if (value) counts[value] = (counts[value] || 0) + 1;
    });

    document
      .querySelectorAll(`[data-filter-type="${filterType}"]`)
      .forEach((el) => {
        if (el.tagName === "INPUT") {
          const label = el.closest("label");
          const countSpan = label?.querySelector(".filter-count");
          const value = el.value;
          const count = counts[value] || 0;

          if (countSpan) {
            countSpan.textContent = count > 0 ? `(${count})` : "";
          }

          // Disable if no items
          if (count === 0 && !el.checked) {
            label.classList.add("opacity-40");
            el.disabled = true;
          } else {
            label.classList.remove("opacity-40");
            el.disabled = false;
          }
        }
      });
  }

  // Update platform counts
  function updatePlatformCounts(ads) {
    const counts = {};
    ads.forEach((ad) => {
      (ad.publisher_platforms || []).forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });

    document.querySelectorAll('[data-filter-type="platform"]').forEach((el) => {
      if (el.tagName === "INPUT") {
        const label = el.closest("label");
        const countSpan = label?.querySelector(".filter-count");
        const value = el.value;
        const count = counts[value] || 0;

        if (countSpan) {
          countSpan.textContent = count > 0 ? `(${count})` : "";
        }

        if (count === 0 && !el.checked) {
          label.classList.add("opacity-40");
          el.disabled = true;
        } else {
          label.classList.remove("opacity-40");
          el.disabled = false;
        }
      }
    });
  }

  // Get base filtered ads (without CTA/media/platform filter, for updating available options)
  function getBaseFilteredAds() {
    const allAds = DataModule.getAllAds();

    return allAds.filter((ad) => {
      // Search filter
      if (currentFilters.search) {
        const searchText = currentFilters.search;
        const adText = (ad.ad_text || "").toLowerCase();
        const title = (ad.title || "").toLowerCase();
        const advertiser = (ad.advertiser_name || "").toLowerCase();
        if (
          !adText.includes(searchText) &&
          !title.includes(searchText) &&
          !advertiser.includes(searchText)
        ) {
          return false;
        }
      }

      // Keyword filter
      if (currentFilters.keywords.length > 0) {
        if (!currentFilters.keywords.includes(ad.keyword)) return false;
      }

      // Country filter
      if (currentFilters.country) {
        if (ad.country !== currentFilters.country) return false;
      }

      // Exclude generic domains
      if (currentFilters.excludeGenericDomains) {
        if (genericDomains.includes(ad.landing_page_domain)) return false;
      }

      // Exclude go. domains
      if (currentFilters.excludeGoDomains) {
        if (ad.landing_page && ad.landing_page.startsWith("https://go."))
          return false;
      }

      // Exclude non-gambling advertisers and domains
      if (currentFilters.excludeNonGambling) {
        // Skip if domain is in gambling whitelist (keep gambling ads)
        if (!gamblingWhitelist.includes(ad.landing_page_domain)) {
          // Check exact match in blacklist
          if (nonGamblingAdvertisers.includes(ad.advertiser_name)) return false;
          if (nonGamblingDomains.includes(ad.landing_page_domain)) return false;

          // Check pattern match in advertiser name
          if (
            containsNonGamblingPattern(
              ad.advertiser_name,
              nonGamblingAdvertiserPatterns
            )
          )
            return false;

          // Check pattern match in domain
          if (
            containsNonGamblingPattern(
              ad.landing_page_domain,
              nonGamblingDomainPatterns
            )
          )
            return false;
          if (
            containsNonGamblingPattern(
              ad.landing_page,
              nonGamblingDomainPatterns
            )
          )
            return false;
        }
      }

      return true;
    });
  }

  // Bind filter events
  function bindFilterEvents() {
    // Search input
    const searchInput = document.getElementById("search-input");
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = e.target.value.trim().toLowerCase();
        updateFilterCounts();
        applyFilters();
      }, 300);
    });

    // Checkbox filters (use event delegation for dynamic elements)
    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-filter-type]")) {
        updateCheckboxFilters();
        updateFilterCounts();
        applyFilters();
      }
    });

    // Media type dropdown
    const mediaTypeFilter = document.getElementById("media-type-filter");
    if (mediaTypeFilter) {
      mediaTypeFilter.addEventListener("change", (e) => {
        currentFilters.mediaType = e.target.value;
        applyFilters();
      });
    }

    // Country dropdown
    const countryFilter = document.getElementById("country-filter");
    if (countryFilter) {
      countryFilter.addEventListener("change", (e) => {
        currentFilters.country = e.target.value;
        updateFilterCounts();
        applyFilters();
      });
    }

    // Exclude generic domains
    const excludeGenericEl = document.getElementById("exclude-generic");
    if (excludeGenericEl) {
      excludeGenericEl.addEventListener("change", (e) => {
        currentFilters.excludeGenericDomains = e.target.checked;
        updateFilterCounts();
        applyFilters();
      });
    }

    // Exclude go. domains
    const excludeGoDomainsEl = document.getElementById("exclude-go-domains");
    if (excludeGoDomainsEl) {
      excludeGoDomainsEl.addEventListener("change", (e) => {
        currentFilters.excludeGoDomains = e.target.checked;
        updateFilterCounts();
        applyFilters();
      });
    }

    // Exclude non-gambling advertisers
    const excludeNonGamblingEl = document.getElementById(
      "exclude-non-gambling"
    );
    if (excludeNonGamblingEl) {
      excludeNonGamblingEl.addEventListener("change", (e) => {
        currentFilters.excludeNonGambling = e.target.checked;
        updateFilterCounts();
        applyFilters();
      });
    }

    // Reset button
    document
      .getElementById("reset-filters")
      .addEventListener("click", resetFilters);
  }

  // Update checkbox filters
  function updateCheckboxFilters() {
    currentFilters.keywords = [];
    currentFilters.platforms = [];
    currentFilters.domains = [];

    document
      .querySelectorAll("[data-filter-type]:checked")
      .forEach((checkbox) => {
        const type = checkbox.dataset.filterType;
        const value = checkbox.value;

        if (type === "keyword") currentFilters.keywords.push(value);
        else if (type === "platform") currentFilters.platforms.push(value);
        else if (type === "domain") currentFilters.domains.push(value);
      });
  }

  // Apply filters to data
  function applyFilters() {
    const allAds = DataModule.getAllAds();

    const filtered = allAds.filter((ad) => {
      // Search filter
      if (currentFilters.search) {
        const searchText = currentFilters.search;
        const adText = (ad.ad_text || "").toLowerCase();
        const title = (ad.title || "").toLowerCase();
        const advertiser = (ad.advertiser_name || "").toLowerCase();
        if (
          !adText.includes(searchText) &&
          !title.includes(searchText) &&
          !advertiser.includes(searchText)
        ) {
          return false;
        }
      }

      // Keyword filter
      if (currentFilters.keywords.length > 0) {
        if (!currentFilters.keywords.includes(ad.keyword)) return false;
      }

      // Country filter
      if (currentFilters.country) {
        if (ad.country !== currentFilters.country) return false;
      }

      // Media type filter
      if (currentFilters.mediaType) {
        if (ad.media_type !== currentFilters.mediaType) return false;
      }

      // Platform filter
      if (currentFilters.platforms.length > 0) {
        const adPlatforms = ad.publisher_platforms || [];
        if (!currentFilters.platforms.some((p) => adPlatforms.includes(p)))
          return false;
      }

      // Exclude generic domains
      if (currentFilters.excludeGenericDomains) {
        if (genericDomains.includes(ad.landing_page_domain)) return false;
      }

      // Exclude go. domains
      if (currentFilters.excludeGoDomains) {
        if (ad.landing_page && ad.landing_page.startsWith("https://go."))
          return false;
      }

      // Exclude non-gambling advertisers and domains
      if (currentFilters.excludeNonGambling) {
        // Skip if domain is in gambling whitelist (keep gambling ads)
        if (!gamblingWhitelist.includes(ad.landing_page_domain)) {
          // Check exact match in blacklist
          if (nonGamblingAdvertisers.includes(ad.advertiser_name)) return false;
          if (nonGamblingDomains.includes(ad.landing_page_domain)) return false;

          // Check pattern match in advertiser name
          if (
            containsNonGamblingPattern(
              ad.advertiser_name,
              nonGamblingAdvertiserPatterns
            )
          )
            return false;

          // Check pattern match in domain
          if (
            containsNonGamblingPattern(
              ad.landing_page_domain,
              nonGamblingDomainPatterns
            )
          )
            return false;
          if (
            containsNonGamblingPattern(
              ad.landing_page,
              nonGamblingDomainPatterns
            )
          )
            return false;
        }
      }

      // Domain filter (show only selected domains)
      if (currentFilters.domains.length > 0) {
        if (!currentFilters.domains.includes(ad.landing_page_domain))
          return false;
      }

      return true;
    });

    DataModule.setFilteredAds(filtered);
    CardsModule.resetPagination();
    CardsModule.renderCards();
    updateAdsCount();
  }

  // Reset all filters
  function resetFilters() {
    // Clear search
    document.getElementById("search-input").value = "";

    // Reset media type dropdown
    const mediaTypeFilter = document.getElementById("media-type-filter");
    if (mediaTypeFilter) {
      mediaTypeFilter.value = "";
    }

    // Reset country dropdown
    const countryFilterEl = document.getElementById("country-filter");
    if (countryFilterEl) {
      countryFilterEl.value = "";
    }

    // Uncheck all checkboxes
    document.querySelectorAll("[data-filter-type]").forEach((cb) => {
      if (cb.tagName === "INPUT") {
        cb.checked = false;
        cb.disabled = false;
        const label = cb.closest("label");
        if (label) label.classList.remove("opacity-40");
      }
    });

    // Reset exclude generic (keep checked by default)
    const excludeGenericEl = document.getElementById("exclude-generic");
    if (excludeGenericEl) {
      excludeGenericEl.checked = true;
    }

    // Reset exclude go. domains (unchecked by default)
    const excludeGoDomainsEl = document.getElementById("exclude-go-domains");
    if (excludeGoDomainsEl) {
      excludeGoDomainsEl.checked = false;
    }

    // Reset exclude non-gambling (unchecked by default)
    const excludeNonGamblingEl = document.getElementById(
      "exclude-non-gambling"
    );
    if (excludeNonGamblingEl) {
      excludeNonGamblingEl.checked = false;
    }

    // Reset filter state
    currentFilters = {
      search: "",
      keywords: [],
      mediaType: "",
      platforms: [],
      domains: [],
      excludeGenericDomains: true,
      excludeGoDomains: false,
      excludeNonGambling: false,
      country: "",
    };

    // Reset data (with exclude generic still active)
    applyFilters();
    updateFilterCounts();
  }

  // Update ads count display
  function updateAdsCount() {
    const filtered = DataModule.getFilteredAds().length;
    const total = DataModule.getAllAds().length;
    document.getElementById("ads-count").textContent =
      filtered === total
        ? `共 ${total} 則廣告`
        : `顯示 ${filtered} / ${total} 則廣告`;
  }

  // Get current filters
  function getCurrentFilters() {
    return { ...currentFilters };
  }

  // Get generic domains list
  function getGenericDomains() {
    return [...genericDomains];
  }

  return {
    initFilters,
    applyFilters,
    resetFilters,
    getCurrentFilters,
    updateAdsCount,
    updateFilterCounts,
    getGenericDomains,
  };
})();
