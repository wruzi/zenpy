// ============================================
// ZenPy - Shop JS
// Premium item shop + live profile/chat preview
// ============================================

if (!requireAuth()) { /* redirected */ }

let shopItems = [];
let userData = null;
let activeCategory = 'all';
const bannerAccentMap = {};

const premiumBannerPrefixes = ['banner_video_'];

function isPremiumMediaBanner(item) {
    if (!item || item.category !== 'profile_banner') return false;
    return premiumBannerPrefixes.some(prefix => item.id.startsWith(prefix));
}

const categorySlotMap = {
    name_style: 'nameStyle',
    avatar_frame: 'frame',
    effect: 'effect',
    name_accessory: 'title',
    chat_extra: 'chatExtra',
    chat_color: 'chatColor',
    chat_background: 'chatBackground',
    profile_card: 'profile_card',
    profile_banner: 'banner'
};

const shopIcons = {
    silver_name: '<svg viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" stroke-width="2"><path d="M12 3l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1 3-6z"/></svg>',
    gold_name: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M12 2l2.8 5.6L21 8.6l-4.5 4.3 1 6.1L12 16.2 6.5 19l1-6.1L3 8.6l6.2-1z"/></svg>',
    rainbow_name: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M4 14a8 8 0 0116 0"/><path d="M7 14a5 5 0 0110 0"/><path d="M10 14a2 2 0 014 0"/></svg>',
    fire_effect: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2"><path d="M12 22c-4 0-7-2.2-7-5.6 0-2.3 1.3-4.7 3-6.7.3 2.3 1.4 3.4 4 4.5 1.8-1.3 3.1-2.7 3.6-5 .9 1.2 3.4 4 3.4 7.2C19 19.8 16 22 12 22z"/></svg>',
    cyberpunk_glow: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FFFF" stroke-width="2"><rect x="4" y="4" width="16" height="16"/><path d="M8 12h8M12 8v8"/></svg>',
    glitch_effect: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M5 5h9v6H9v8H5z"/><path d="M19 19h-9v-6h5V5h4z"/></svg>',
    matrix_rain: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF41" stroke-width="2"><path d="M8 5v14M12 3v18M16 7v10"/></svg>',
    sparkle_effect: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    trail_effect: '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M3 12h6l2 5 3-10 2 5h5"/></svg>',
    neon_frame: '<svg viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><rect x="7" y="7" width="10" height="10"/></svg>',
    pixel_frame: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M3 18l2-9 5 4 2-7 2 7 5-4 2 9z"/></svg>',
    animated_avatar: '<svg viewBox="0 0 24 24" fill="none" stroke="#9400D3" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>',
    frame_prism: '<svg viewBox="0 0 24 24" fill="none" stroke="#7ef3ff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>',
    frame_shadow: '<svg viewBox="0 0 24 24" fill="none" stroke="#9a7cff" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
    frame_holo: '<svg viewBox="0 0 24 24" fill="none" stroke="#00ffd5" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h16"/></svg>',
    frame_arcane: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff66ff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M7 7l10 10M17 7L7 17"/></svg>',
    vip_border: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M12 2l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 9l6-1 3-6z"/></svg>',
    custom_title: '<svg viewBox="0 0 24 24" fill="none" stroke="#7EF3FF" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10h8M8 14h5"/></svg>',
    title_architect: '<svg viewBox="0 0 24 24" fill="none" stroke="#6FE7FF" stroke-width="2"><path d="M4 20h16"/><path d="M8 20V9l4-4 4 4v11"/></svg>',
    title_legend: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M4 18h16"/><path d="M7 18l2-10 3 4 3-4 2 10"/></svg>',
    emoji_pack: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FFFF" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>',
    chat_terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF41" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l2 2-2 2M11 13h6"/></svg>',
    chat_royal: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M4 18h16"/><path d="M5 18l2-8 5 4 5-4 2 8"/></svg>',
    chat_color_ice: '<svg viewBox="0 0 24 24" fill="none" stroke="#7ef3ff" stroke-width="2"><path d="M12 3v18M5 8h14M5 16h14"/></svg>',
    chat_color_mint: '<svg viewBox="0 0 24 24" fill="none" stroke="#52ffb7" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M8 12h8"/></svg>',
    chat_color_gold: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2"><path d="M12 3l2.6 5.3L20 9l-4 3.9.9 5.6L12 15.8 7.1 18.5 8 12.9 4 9l5.4-.7z"/></svg>',
    chat_color_rose: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff86c8" stroke-width="2"><path d="M12 21s-7-4.4-7-10a4 4 0 017-2 4 4 0 017 2c0 5.6-7 10-7 10z"/></svg>',
    chat_bg_midnight: '<svg viewBox="0 0 24 24" fill="none" stroke="#183050" stroke-width="2"><rect x="3" y="5" width="18" height="14"/><path d="M6 9h12M6 13h8"/></svg>',
    chat_bg_matrix: '<svg viewBox="0 0 24 24" fill="none" stroke="#0f3d1e" stroke-width="2"><rect x="3" y="5" width="18" height="14"/><path d="M8 8v8M12 7v10M16 9v6"/></svg>',
    chat_bg_plum: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b1f4d" stroke-width="2"><rect x="3" y="5" width="18" height="14"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/></svg>',
    chat_bg_ember: '<svg viewBox="0 0 24 24" fill="none" stroke="#4a2218" stroke-width="2"><rect x="3" y="5" width="18" height="14"/><path d="M8 16l4-8 4 8"/></svg>',
    banner_nebula: '<svg viewBox="0 0 24 24" fill="none" stroke="#7f6dff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="10" cy="12" r="2"/></svg>',
    banner_aether: '<svg viewBox="0 0 24 24" fill="none" stroke="#00ffa8" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M4 13h16"/></svg>',
    banner_quantum: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff4dff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 9l8 6M16 9l-8 6"/></svg>',
    banner_video_premium: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff6a00" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10,8 16,12 10,16"/></svg>',
    banner_video_022: '<svg viewBox="0 0 24 24" fill="none" stroke="#66d8ff" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10,8 16,12 10,16"/></svg>',
    banner_video_sakuna: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff4066" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10,8 16,12 10,16"/></svg>',
    banner_video_zenistu: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffe066" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10,8 16,12 10,16"/></svg>',
    banner_color_inferno: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff6a00" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>',
    banner_color_ocean: '<svg viewBox="0 0 24 24" fill="none" stroke="#2ca8ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>',
    banner_color_forest: '<svg viewBox="0 0 24 24" fill="none" stroke="#28cc72" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>',
    banner_color_violet: '<svg viewBox="0 0 24 24" fill="none" stroke="#9b6dff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/></svg>',
    banner_equation_sim: '<svg viewBox="0 0 24 24" fill="none" stroke="#7ef3ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h3m4 0h3M11 9l2 6"/></svg>',
    banner_physics_sim: '<svg viewBox="0 0 24 24" fill="none" stroke="#52ffb7" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 15c3-6 9-6 12 0"/></svg>',
    banner_physics_orbital: '<svg viewBox="0 0 24 24" fill="none" stroke="#66c7ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 12h2M17 12h2"/></svg>',
    banner_physics_collider: '<svg viewBox="0 0 24 24" fill="none" stroke="#7affc3" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 9l12 6M18 9L6 15"/></svg>',
    banner_physics_ionstorm: '<svg viewBox="0 0 24 24" fill="none" stroke="#9fd9ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 9l-2 3h3l-1 3 4-5h-3l1-1"/></svg>',
    banner_physics_gravity_well: '<svg viewBox="0 0 24 24" fill="none" stroke="#c5b0ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="12" r="4.6"/></svg>',
    banner_physics_reactor: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffd86a" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M12 8v-2M12 18v-2M8 12H6M18 12h-2"/></svg>',
    banner_physics_wormhole_lens: '<svg viewBox="0 0 24 24" fill="none" stroke="#9fd0ff" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M8 12a4 4 0 018 0"/></svg>',
    banner_physics_magnetar_field: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff6aa8" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 9v6h2V9h2v6M15 9v6h2V9h2"/></svg>',
    banner_physics_photon_lattice: '<svg viewBox="0 0 24 24" fill="none" stroke="#7affe3" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h10M7 14h10M9 8v8M15 8v8"/></svg>',
    card_synthwave: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff00ff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
    card_hacker: '<svg viewBox="0 0 24 24" fill="none" stroke="#00ff41" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9h3M6 13h6"/></svg>',
    card_ruby: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff003c" stroke-width="2"><polygon points="12 2 22 8 19 18 5 18 2 8"/></svg>',
    card_aurora: '<svg viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/></svg>',
    card_void: '<svg viewBox="0 0 24 24" fill="none" stroke="#9400D3" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>',
    card_solar: '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    card_neon: '<svg viewBox="0 0 24 24" fill="none" stroke="#00FFEF" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 12h10"/></svg>',
    card_phantom: '<svg viewBox="0 0 24 24" fill="none" stroke="#8f5fff" stroke-width="2"><path d="M12 3c5 0 8 4 8 8s-3 10-8 10-8-6-8-10 3-8 8-8z"/></svg>',
    card_orion: '<svg viewBox="0 0 24 24" fill="none" stroke="#42a0ff" stroke-width="2"><path d="M4 19l4-8 4 2 4-6 4 12"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
};

function findShopItemById(itemId) {
    return shopItems.find(item => item.id === itemId) || null;
}

function resolveItemClass(value) {
    if (!value) return null;
    return findShopItemById(value)?.cssClass || value;
}

function addClassTokens(element, classString) {
    if (!element || !classString) return;
    classString.split(' ').filter(Boolean).forEach(token => element.classList.add(token));
}

function getAvatarUrl(user) {
    if (!user?.image || user.image === 'default-avatar.png' || user.image === 'default-avatar.svg') return '/assets/avatars/default-avatar.svg';
    if (user.image.startsWith('http') || user.image.startsWith('/')) return user.image;
    return `/assets/avatars/${encodeURIComponent(user.image)}`;
}

function getCategoryIcon(item) {
    if (item?.category === 'profile_banner' && isPremiumMediaBanner(item)) {
        const accent = bannerAccentMap[item.id] || '#FFD700';
        return `<svg viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10,8 16,12 10,16"/></svg>`;
    }
    return shopIcons[item.id] || shopIcons.default;
}

function getBannerAccent(item) {
    if (!item) return '#FF1493';
    return bannerAccentMap[item.id] || '#FF1493';
}

function hexToRgba(hexColor, alpha = 0.35) {
    const normalized = String(hexColor || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(255,20,147,${alpha})`;
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${red},${green},${blue},${alpha})`;
}

function hexToRgbTuple(hexColor) {
    const normalized = String(hexColor || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '255, 20, 147';
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    return `${red}, ${green}, ${blue}`;
}

async function preloadBannerAccents(items = []) {
    const bannerItems = items.filter(item => item?.category === 'profile_banner' && item?.assetPath);
    await Promise.all(bannerItems.map(async (item) => {
        const accent = await getBannerAccentColor(item.assetPath, '#FF1493');
        bannerAccentMap[item.id] = accent;
    }));
}

function applyShowcaseThumbAccents() {
    document.querySelectorAll('.premium-thumbs img.premium-gif').forEach(async (imgEl) => {
        const src = imgEl.getAttribute('src');
        if (!src) return;
        const accent = await getBannerAccentColor(src, '#FFD700');
        imgEl.style.borderColor = accent;
        imgEl.style.boxShadow = `0 0 0 1px ${hexToRgba(accent, 0.45)}`;
    });

    const showcaseMain = document.querySelector('.premium-video');
    if (showcaseMain) {
        const src = showcaseMain.style.backgroundImage?.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
        if (src) {
            getBannerAccentColor(src, '#FF1493').then((accent) => {
                showcaseMain.style.borderColor = accent;
                showcaseMain.style.boxShadow = `inset 0 0 0 2px ${hexToRgba(accent, 0.6)}, 4px 4px 0px ${hexToRgba(accent, 0.28)}`;
            });
        }
    }
}

function getMergedNameStyle(equipped = {}, cssMap = null) {
    return cssMap?.nameStyle || [
        resolveItemClass(equipped.nameStyle),
        resolveItemClass(equipped.effect)
    ].filter(Boolean).join(' ') || null;
}

function isItemEquipped(item) {
    const equipped = userData?.inventory?.equipped || {};
    const slot = categorySlotMap[item.category];
    if (!slot) return false;
    if (slot === 'title') return equipped.title === item.name;
    return equipped[slot] === item.id;
}

function getTitleClassByLabel(titleLabel) {
    if (!titleLabel || titleLabel === 'Newbie') return null;
    const match = shopItems.find(item => item.category === 'name_accessory' && item.name === titleLabel);
    return match?.cssClass || null;
}

function buildCssMapFromEquipped(equipped = {}) {
    return {
        nameStyle: getMergedNameStyle(equipped),
        frame: resolveItemClass(equipped.frame),
        profileCard: resolveItemClass(equipped.profile_card),
        chatStyle: resolveItemClass(equipped.chatExtra),
        chatColor: resolveItemClass(equipped.chatColor),
        chatBackground: resolveItemClass(equipped.chatBackground),
        banner: resolveItemClass(equipped.banner),
        bannerAsset: findShopItemById(equipped.banner)?.assetPath || null
    };
}

function applyShopPreview(item, currentUser) {
    const previewCard = document.getElementById('profilePreview');
    const previewBanner = document.getElementById('previewBanner');
    const previewAvatarImg = document.getElementById('previewAvatarImg');
    const previewUsername = document.getElementById('previewUsername');
    const previewUserlevel = document.getElementById('previewUserlevel');
    const previewTitle = document.getElementById('previewTitle');
    const previewChat = document.getElementById('previewChatBubble');
    const previewChatName = document.getElementById('previewChatUsername');
    const previewChatText = document.getElementById('previewChatText');

    if (!previewCard || !previewBanner || !previewAvatarImg || !previewUsername || !previewUserlevel || !previewTitle || !previewChat || !previewChatName || !previewChatText) return;

    previewCard.className = 'profile-preview-card';
    previewBanner.className = 'preview-banner';
    previewBanner.style.backgroundImage = '';
    previewBanner.style.boxShadow = '';
    previewAvatarImg.className = '';
    previewUsername.className = 'preview-username';
    previewTitle.className = 'preview-title';
    previewChat.className = 'preview-chat-bubble';
    previewChatName.className = 'preview-chat-username';
    previewChatText.className = 'preview-chat-text';

    const equipped = currentUser?.inventory?.equipped || {};
    const cssMap = currentUser?.cssMap || buildCssMapFromEquipped(equipped);
    const previewingBanner = item?.category === 'profile_banner';
    const effectiveBannerClass = previewingBanner ? item?.cssClass : cssMap.banner;
    const effectiveBannerAsset = previewingBanner
        ? item?.assetPath
        : (cssMap.bannerAsset || findShopItemById(equipped.banner)?.assetPath || null);

    addClassTokens(previewCard, cssMap.profileCard);
    addClassTokens(previewBanner, effectiveBannerClass);
    if (effectiveBannerAsset) {
        previewBanner.style.backgroundImage = `url('${effectiveBannerAsset}')`;
        const accentSourceItem = previewingBanner ? item : findShopItemById(equipped.banner);
        const accent = getBannerAccent(accentSourceItem);
        previewBanner.style.setProperty('--banner-glow-rgb', hexToRgbTuple(accent));
        previewBanner.style.animation = 'premium-banner-glow 2.8s ease-in-out infinite';
        previewBanner.style.boxShadow = `inset 0 0 0 2px ${hexToRgba(accent, 0.7)}, 0 0 0 1px ${hexToRgba(accent, 0.35)}`;
    } else {
        previewBanner.style.animation = '';
    }
    addClassTokens(previewAvatarImg, cssMap.frame);
    addClassTokens(previewUsername, cssMap.nameStyle);
    addClassTokens(previewChatName, cssMap.nameStyle);
    addClassTokens(previewChat, cssMap.chatStyle);
    addClassTokens(previewChat, cssMap.chatBackground);
    addClassTokens(previewChatText, cssMap.chatColor);
    addClassTokens(previewTitle, getTitleClassByLabel(equipped.title));

    if (item?.cssClass) {
        if (item.category === 'profile_card') addClassTokens(previewCard, item.cssClass);
        if (item.category === 'avatar_frame') addClassTokens(previewAvatarImg, item.cssClass);
        if (item.category === 'name_style' || item.category === 'effect') {
            addClassTokens(previewUsername, item.cssClass);
            addClassTokens(previewChatName, item.cssClass);
        }
        if (item.category === 'chat_extra') addClassTokens(previewChat, item.cssClass);
        if (item.category === 'chat_background') addClassTokens(previewChat, item.cssClass);
        if (item.category === 'chat_color') addClassTokens(previewChatText, item.cssClass);
    }

    previewAvatarImg.src = getAvatarUrl(currentUser);
    previewAvatarImg.onerror = () => { previewAvatarImg.src = '/assets/avatars/default-avatar.svg'; };

    previewUsername.textContent = currentUser?.username || 'Username';
    previewChatName.textContent = currentUser?.username || 'Username';
    previewUserlevel.textContent = `Lv. ${currentUser?.level || 1}`;
    previewTitle.textContent = equipped.title && equipped.title !== 'Newbie' ? equipped.title : 'Newbie';

    if (item?.category === 'name_accessory') {
        previewTitle.textContent = item.name;
        addClassTokens(previewTitle, item.cssClass);
    }
}

function previewItem(itemId) {
    const item = findShopItemById(itemId);
    applyShopPreview(item, userData);
    showToast(`Previewing ${item?.name || 'item'}`, 'info');
}

async function loadShop() {
    const data = await setupSidebar();
    if (!data) return;

    userData = data.user;
    userData.currentQuestion = data.progress?.currentQuestion || 1;
    userData.cssMap = userData.cssMap || buildCssMapFromEquipped(userData.inventory?.equipped || {});

    document.getElementById('zenBalance').textContent = formatNumber(userData.zen || 0);

    const itemsData = await apiCall('/api/shop/items');
    if (!itemsData?.success) return;

    shopItems = itemsData.items || [];
    await preloadBannerAccents(shopItems);
    applyShowcaseThumbAccents();
    renderShop('all');
    renderInventory();
    applyShopPreview(null, userData);
}

function renderShop(category = 'all') {
    activeCategory = category;
    const grid = document.getElementById('shopGrid');
    const premiumShowcase = document.getElementById('premiumShowcase');

    if (premiumShowcase) {
        premiumShowcase.style.display = (category === 'all' || category === 'premium') ? 'grid' : 'none';
    }

    const filtered = category === 'all'
        ? shopItems
        : category === 'chat'
            ? shopItems.filter(item => ['chat_extra', 'chat_color', 'chat_background'].includes(item.category))
            : category === 'premium'
                ? shopItems.filter(item => isPremiumMediaBanner(item))
                : category === 'profile_banner'
                    ? shopItems.filter(item => item.category === 'profile_banner' && !isPremiumMediaBanner(item))
                    : shopItems.filter(item => item.category === category);

    grid.innerHTML = filtered.map(item => {
        const owned = userData?.inventory?.owned?.includes(item.id);
        const equipped = isItemEquipped(item);
        const canAfford = (userData?.zen || 0) >= item.price;

        let locked = false;
        let lockReason = '';
        if (item.requirement?.type === 'questions' && (userData?.currentQuestion || 1) < item.requirement.value) {
            locked = true;
            lockReason = `Need Q${item.requirement.value}`;
        }
        if (item.requirement?.type === 'xp' && (userData?.xp || 0) < item.requirement.value) {
            locked = true;
            lockReason = `Need ${item.requirement.value} XP`;
        }
        if (item.requirement?.type === 'streak' && (userData?.streak || 0) < item.requirement.value) {
            locked = true;
            lockReason = `Need ${item.requirement.value}-day streak`;
        }

        const accent = getBannerAccent(item);
        const bannerStyle = isPremiumMediaBanner(item)
            ? `border-color:${accent}; box-shadow:4px 4px 0px ${hexToRgba(accent, 0.28)}; animation: premium-banner-glow 2.8s ease-in-out infinite; --banner-glow-rgb:${hexToRgbTuple(accent)};`
            : '';
        const lockedStyle = locked ? 'opacity:0.58;' : '';

        return `
            <div class="item-card rarity-${item.rarity} animate-fadeInUp" style="${bannerStyle}${lockedStyle}">
                ${owned ? '<div class="owned-badge">OWNED</div>' : ''}
                <div class="item-emoji">${getCategoryIcon(item)}</div>
                <div class="item-name ${item.category === 'name_style' || item.category === 'effect' ? (item.cssClass || '') : ''}">${item.name}</div>
                <div class="item-desc">${item.description}</div>
                <div class="item-price">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg>
                    ${item.price.toLocaleString()} Zen
                </div>
                <div class="item-rarity"><span class="badge badge-${item.rarity}">${item.rarity}</span></div>
                ${locked ? `<div class="item-req"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> ${lockReason}</div>` : ''}
                ${owned
                    ? `<button class="btn ${equipped ? 'btn-secondary' : 'btn-primary'} btn-sm w-full" onclick="equipItem('${item.id}', '${item.category}')">${equipped ? 'Unequip' : 'Equip'}</button>`
                    : (locked
                        ? '<button class="btn btn-ghost btn-sm w-full" disabled>LOCKED</button>'
                        : `<button class="btn btn-primary btn-sm w-full" ${!canAfford ? 'disabled' : ''} onclick="openPurchaseModal('${item.id}')">${canAfford ? 'BUY' : 'Not enough Zen'}</button>`)
                }
                <button class="btn btn-ghost btn-sm w-full mt-1" onclick="previewItem('${item.id}')">Preview</button>
            </div>`;
    }).join('');
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    const owned = userData?.inventory?.owned || [];

    if (owned.length === 0) {
        grid.innerHTML = '<p class="text-muted text-sm">No items owned yet. Start shopping!</p>';
        return;
    }

    grid.innerHTML = owned.map(itemId => {
        const item = findShopItemById(itemId);
        if (!item) return '';

        const equipped = isItemEquipped(item);
        return `
            <div class="inv-item ${equipped ? 'equipped' : ''}">
                <div class="inv-emoji">${getCategoryIcon(item)}</div>
                <strong>${item.name}</strong>
                <br><span class="badge badge-${item.rarity} mt-1">${item.rarity}</span>
                ${equipped ? '<br><span class="text-accent text-sm">Equipped</span>' : ''}
            </div>`;
    }).join('');
}

function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (event?.target) event.target.classList.add('active');
    renderShop(category);
}

let pendingPurchase = null;

function openPurchaseModal(itemId) {
    const item = findShopItemById(itemId);
    if (!item) return;

    pendingPurchase = itemId;
    document.getElementById('purchaseDetails').innerHTML =
        `Buy <strong>${item.name}</strong> for <span class="text-warning"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" style="vertical-align:middle;"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg> ${item.price.toLocaleString()} Zen</span>?`;
    document.getElementById('purchaseModal').classList.add('active');
    document.getElementById('confirmPurchase').onclick = () => buyItem(itemId);
}

function closePurchaseModal() {
    pendingPurchase = null;
    document.getElementById('purchaseModal').classList.remove('active');
}

async function buyItem(itemId) {
    closePurchaseModal();

    const data = await apiCall('/api/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemId })
    });

    if (!data?.success) {
        showToast(data?.message || 'Purchase failed', 'error');
        return;
    }

    showToast(data.message, 'success');
    userData.zen = data.zenRemaining;
    userData.inventory = data.inventory;
    userData.cssMap = userData.cssMap || buildCssMapFromEquipped(data.inventory?.equipped || {});

    document.getElementById('zenBalance').textContent = formatNumber(userData.zen || 0);
    document.getElementById('sidebarZen').textContent = formatNumber(userData.zen || 0);
    renderShop(activeCategory);
    renderInventory();
    applyShopPreview(null, userData);
}

async function equipItem(itemId, category) {
    const slot = categorySlotMap[category] || 'nameStyle';
    const item = findShopItemById(itemId);
    const currentlyEquipped = slot === 'title'
        ? userData?.inventory?.equipped?.title === item?.name
        : userData?.inventory?.equipped?.[slot] === itemId;

    const data = await apiCall('/api/shop/equip', {
        method: 'POST',
        body: JSON.stringify({ itemId: currentlyEquipped ? null : itemId, slot })
    });

    if (!data?.success) {
        showToast(data?.message || 'Failed to equip', 'error');
        return;
    }

    userData.inventory.equipped = data.equipped;
    userData.cssMap = buildCssMapFromEquipped(data.equipped || {});
    showToast(currentlyEquipped ? 'Item unequipped' : 'Item equipped!', 'success');
    renderShop(activeCategory);
    renderInventory();
    applyShopPreview(null, userData);
}

document.addEventListener('DOMContentLoaded', loadShop);
