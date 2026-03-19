// ============================================
// ZenPy - Shop JS
// SVG icons, JS username effects, interactive shop
// ============================================

if (!requireAuth()) { /* redirected */ }

let shopItems = [];
let userData = null;
let activeCategory = 'all';

// --- SVG Icons for shop items ---
const shopIcons = {
    'silver_name': '<svg viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'gold_name': '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'rainbow_name': '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" stroke="#FF1493"/></svg>',
    'neon_frame': '<svg viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><rect x="6" y="6" width="12" height="12"/></svg>',
    'pixel_frame': '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF88" stroke-width="2"><rect x="2" y="2" width="6" height="6"/><rect x="9" y="2" width="6" height="6"/><rect x="16" y="2" width="6" height="6"/><rect x="2" y="9" width="6" height="6"/><rect x="16" y="9" width="6" height="6"/><rect x="2" y="16" width="6" height="6"/><rect x="9" y="16" width="6" height="6"/><rect x="16" y="16" width="6" height="6"/></svg>',
    'crown': '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M2 18l3-11 5 5 2-7 2 7 5-5 3 11z"/><path d="M2 18h20"/></svg>',
    'fire_effect': '<svg viewBox="0 0 24 24" fill="none" stroke="#FF4444" stroke-width="2"><path d="M12 22c-4.97 0-9-2.69-9-6s2-6.5 4-9c0 3.5 2 5 4 6.5 2-1.5 4-3 4-6.5 2 2.5 4 5 4 9s-4.03 6-7 6z"/></svg>',
    'sparkle_effect': '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>',
    'glitch_effect': '<svg viewBox="0 0 24 24" fill="none" stroke="#9400D3" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'cyberpunk_glow': '<svg viewBox="0 0 24 24" fill="none" stroke="#00FFFF" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    'matrix_rain': '<svg viewBox="0 0 24 24" fill="none" stroke="#00FF41" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    'vip_border': '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'custom_title': '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    'animated_avatar': '<svg viewBox="0 0 24 24" fill="none" stroke="#9400D3" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'emoji_pack': '<svg viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    'trail_effect': '<svg viewBox="0 0 24 24" fill="none" stroke="#FF1493" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/></svg>'
};

// --- JavaScript Username Effects ---
const usernameEffects = {
    silver_name: {
        apply(el) {
            el.style.color = '#C0C0C0';
            el.style.textShadow = '2px 2px 0px rgba(192,192,192,0.3)';
        }
    },
    gold_name: {
        apply(el) {
            el.style.color = '#FFD700';
            el.style.textShadow = '2px 2px 0px rgba(255,215,0,0.4)';
            // Shimmer effect via animation
            el.style.animation = 'gold-shimmer 2s ease-in-out infinite';
        }
    },
    rainbow_name: {
        apply(el) {
            const colors = ['#FF1493', '#FF4444', '#FFD700', '#00FF88', '#1E90FF', '#9400D3'];
            let idx = 0;
            el.dataset.rainbowInterval = setInterval(() => {
                el.style.color = colors[idx % colors.length];
                el.style.textShadow = `2px 2px 0px ${colors[idx % colors.length]}40`;
                idx++;
            }, 500);
        }
    },
    cyberpunk_glow: {
        apply(el) {
            el.style.color = '#00FFFF';
            el.style.textShadow = '0 0 4px #00FFFF, 2px 2px 0px #FF1493';
            el.style.letterSpacing = '0.15em';
            // Flicker effect
            el.dataset.cyberpunkInterval = setInterval(() => {
                el.style.opacity = Math.random() > 0.95 ? '0.7' : '1';
            }, 100);
        }
    },
    glitch_effect: {
        apply(el) {
            el.style.position = 'relative';
            el.style.color = '#FF1493';
            el.dataset.glitchInterval = setInterval(() => {
                if (Math.random() > 0.9) {
                    const offsetX = (Math.random() - 0.5) * 4;
                    const offsetY = (Math.random() - 0.5) * 2;
                    el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                    el.style.textShadow = `${-offsetX}px 0 #00FFFF, ${offsetX}px 0 #FF4444`;
                    setTimeout(() => {
                        el.style.transform = 'translate(0, 0)';
                        el.style.textShadow = 'none';
                    }, 80);
                }
            }, 200);
        }
    },
    matrix_rain: {
        apply(el) {
            el.style.color = '#00FF41';
            el.style.fontFamily = "'JetBrains Mono', monospace";
            el.style.textShadow = '2px 2px 0px rgba(0,255,65,0.3)';
        }
    },
    fire_effect: {
        apply(el) {
            const fireColors = ['#FF4444', '#FF6600', '#FFD700', '#FF4444'];
            let idx = 0;
            el.dataset.fireInterval = setInterval(() => {
                el.style.color = fireColors[idx % fireColors.length];
                el.style.textShadow = `0 -2px 4px ${fireColors[idx % fireColors.length]}80, 2px 2px 0px rgba(0,0,0,0.5)`;
                idx++;
            }, 300);
        }
    },
    sparkle_effect: {
        apply(el) {
            el.style.color = '#FFD700';
            el.dataset.sparkleInterval = setInterval(() => {
                const sparkle = document.createElement('span');
                sparkle.textContent = '*';
                sparkle.style.cssText = `
                    position: absolute; color: #FFD700; font-size: 10px; pointer-events: none;
                    top: ${Math.random() * 100}%; left: ${Math.random() * 100}%;
                    animation: sparkle-fade 0.8s ease forwards;
                `;
                el.style.position = 'relative';
                el.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 800);
            }, 600);
        }
    },
    trail_effect: {
        apply(el) {
            el.style.color = '#FF1493';
            el.style.textShadow = '1px 0 #FF149360, 2px 0 #FF149330, 3px 0 #FF149310';
        }
    }
};

// Inject CSS for JS effects
const effectStyles = document.createElement('style');
effectStyles.textContent = `
    @keyframes gold-shimmer {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; text-shadow: 2px 2px 0px rgba(255,215,0,0.6); }
    }
    @keyframes sparkle-fade {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to   { opacity: 0; transform: scale(0.5) translateY(-10px); }
    }
`;
document.head.appendChild(effectStyles);

async function loadShop() {
    const data = await setupSidebar();
    if (!data) return;
    userData = data.user;

    document.getElementById('zenBalance').textContent = formatNumber(userData.zen);

    const itemsData = await apiCall('/api/shop/items');
    if (itemsData?.success) {
        shopItems = itemsData.items;
        renderShop();
        renderInventory();
    }
}

function renderShop(category = 'all') {
    activeCategory = category;
    const grid = document.getElementById('shopGrid');
    
    let filtered = shopItems;
    if (category !== 'all') {
        filtered = shopItems.filter(item => item.category === category);
    }

    const progress = userData ? (userData.currentQuestion || 1) : 1;

    grid.innerHTML = filtered.map(item => {
        const owned = userData?.inventory?.owned?.includes(item.id);
        const equipped = Object.values(userData?.inventory?.equipped || {}).includes(item.id);
        const canAfford = userData?.zen >= item.price;
        
        let locked = false;
        let lockReason = '';
        if (item.requirement) {
            if (item.requirement.type === 'questions' && (userData?.currentQuestion || 1) < item.requirement.value) {
                locked = true;
                lockReason = `Need Q${item.requirement.value}`;
            }
            if (item.requirement.type === 'xp' && (userData?.xp || 0) < item.requirement.value) {
                locked = true;
                lockReason = `Need ${item.requirement.value} XP`;
            }
            if (item.requirement.type === 'streak' && (userData?.streak || 0) < item.requirement.value) {
                locked = true;
                lockReason = `Need ${item.requirement.value}-day streak`;
            }
        }

        const iconSVG = shopIcons[item.id] || shopIcons.default;

        return `
            <div class="item-card rarity-${item.rarity} animate-fadeInUp" ${locked ? 'style="opacity:0.5"' : ''}>
                ${owned ? '<div class="owned-badge">OWNED</div>' : ''}
                <span class="item-emoji">${iconSVG}</span>
                <div class="item-name ${item.cssClass || ''}" id="preview-${item.id}">${item.name}</div>
                <div class="item-desc">${item.description}</div>
                <div class="item-price">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg>
                    ${item.price.toLocaleString()} Zen
                </div>
                <div class="item-rarity"><span class="badge badge-${item.rarity}">${item.rarity}</span></div>
                ${locked ? `<div class="item-req"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> ${lockReason}</div>` : ''}
                ${owned 
                    ? `<button class="btn ${equipped ? 'btn-secondary' : 'btn-primary'} btn-sm w-full" onclick="equipItem('${item.id}', '${item.category}')">${equipped ? 'Unequip' : 'Equip'}</button>`
                    : locked 
                        ? '<button class="btn btn-ghost btn-sm w-full" disabled>LOCKED</button>'
                        : `<button class="btn btn-primary btn-sm w-full" ${!canAfford ? 'disabled' : ''} onclick="openPurchaseModal('${item.id}')">${canAfford ? 'BUY' : 'Not enough Zen'}</button>`
                }
            </div>`;
    }).join('');

    // Apply live preview effects on name elements
    setTimeout(() => {
        filtered.forEach(item => {
            const previewEl = document.getElementById(`preview-${item.id}`);
            if (previewEl && usernameEffects[item.id]) {
                usernameEffects[item.id].apply(previewEl);
            }
        });
    }, 100);
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    const owned = userData?.inventory?.owned || [];
    
    if (owned.length === 0) {
        grid.innerHTML = '<p class="text-muted text-sm">No items owned yet. Start shopping!</p>';
        return;
    }

    grid.innerHTML = owned.map(itemId => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return '';
        const equipped = Object.values(userData?.inventory?.equipped || {}).includes(itemId);
        const iconSVG = shopIcons[itemId] || shopIcons.default;
        
        return `
            <div class="inv-item ${equipped ? 'equipped' : ''}">
                <div class="inv-emoji">${iconSVG}</div>
                <strong>${item.name}</strong>
                <br><span class="badge badge-${item.rarity} mt-1">${item.rarity}</span>
                ${equipped ? '<br><span class="text-accent text-sm">Equipped</span>' : ''}
            </div>`;
    }).join('');
}

function getCategoryLabel(cat) {
    const labels = {
        'all': 'All', 'name_style': 'Names', 'avatar_frame': 'Frames',
        'effect': 'Effects', 'name_accessory': 'Titles', 'chat_extra': 'Chat'
    };
    return labels[cat] || cat;
}

function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderShop(category);
}

// --- Purchase Modal ---
let pendingPurchase = null;

function openPurchaseModal(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    pendingPurchase = itemId;
    const iconSVG = shopIcons[itemId] || shopIcons.default;
    document.getElementById('purchaseDetails').innerHTML = 
        `Buy <strong>${item.name}</strong> for <span class="text-warning"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" style="vertical-align:middle;"><circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3a1.5 1.5 0 000 3h1a1.5 1.5 0 010 3h-3m2-8v1m0 6v1"/></svg> ${item.price.toLocaleString()} Zen</span>?`;
    document.getElementById('purchaseModal').classList.add('active');
    
    document.getElementById('confirmPurchase').onclick = () => buyItem(itemId);
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').classList.remove('active');
    pendingPurchase = null;
}

async function buyItem(itemId) {
    closePurchaseModal();
    
    const data = await apiCall('/api/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemId })
    });

    if (data?.success) {
        showToast(`${data.message}`, 'success');
        userData.zen = data.zenRemaining;
        userData.inventory = data.inventory;
        document.getElementById('zenBalance').textContent = formatNumber(userData.zen);
        document.getElementById('sidebarZen').textContent = formatNumber(userData.zen);
        renderShop(activeCategory);
        renderInventory();
    } else {
        showToast(data?.message || 'Purchase failed', 'error');
    }
}

async function equipItem(itemId, category) {
    const slotMap = {
        'name_style': 'nameStyle',
        'avatar_frame': 'frame',
        'effect': 'effect',
        'name_accessory': 'title',
        'chat_extra': 'chatExtra'
    };
    const slot = slotMap[category] || 'nameStyle';
    
    const currentlyEquipped = userData?.inventory?.equipped?.[slot] === itemId;
    
    const data = await apiCall('/api/shop/equip', {
        method: 'POST',
        body: JSON.stringify({ itemId: currentlyEquipped ? null : itemId, slot })
    });

    if (data?.success) {
        userData.inventory.equipped = data.equipped;
        showToast(currentlyEquipped ? 'Item unequipped' : 'Item equipped!', 'success');
        renderShop(activeCategory);
        renderInventory();
    } else {
        showToast(data?.message || 'Failed to equip', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadShop);
