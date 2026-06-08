/**
 * Maila's Interactive Love Island Portal
 * ----------------------------------------
 * Sections:
 *   1. Season Theme Registry
 *   2. App State
 *   3. Theme System  (loadTheme / applyTheme)
 *   4. LocalStorage Helpers
 *   5. Toast System
 *   6. Confetti / Particle System
 *   7. Authentication & Routing
 *   8. Maila's Portal Rendering
 *   9. Admin Panel Rendering
 *      9a. Theme Selector Panel
 *      9b. Invite Manager Panel
 *      9c. Code Exporter
 */

// ============================================================
// 1. SEASON THEME REGISTRY
// ============================================================
// Add a new object here to create a new season theme.
// No CSS changes required — every value below maps directly
// to a CSS custom property that is injected at runtime.
const SEASON_THEMES = {
  'love-island': {
    key:             'love-island',
    name:            'Love Island',
    emoji:           '🏝️',
    // Text labels that update site-wide
    logoText:        'Love Island',
    tagline:         'MJ & JM 44',
    invitesTitle:    'Date Night Invites',
    invitesSubtitle: 'Exciting plans await us',
    footerBrand:     'Love Island',
    // CSS custom property values injected onto <html>
    cssVars: {
      '--theme-primary':       '#ff2e7e',
      '--theme-secondary':     '#00f0ff',
      '--theme-tertiary':      '#b92eff',
      '--theme-gradient-mid':  '#ff6aa5',
      '--theme-bg-hint':       '#11001c',
      '--theme-primary-rgb':   '255, 46, 126',
      '--theme-secondary-rgb': '0, 240, 255',
    },
    // Particle burst colours for the confetti effect
    particles: ['#ff2e7e', '#00f0ff', '#b92eff', '#ffd000', '#ff8a65', '#ffffff'],
    // Preview swatches shown on the admin theme card
    swatches: ['#ff2e7e', '#b92eff', '#00f0ff'],
  },

  'winter-frost': {
    key:             'winter-frost',
    name:            'Winter Nights',
    emoji:           '❄️',
    logoText:        'Winter Nights',
    tagline:         'Cosy Season 44',
    invitesTitle:    'Cosy Winter Plans',
    invitesSubtitle: 'Stay warm together',
    footerBrand:     'Winter Nights',
    cssVars: {
      '--theme-primary':       '#80d8ff',
      '--theme-secondary':     '#c8b8ff',
      '--theme-tertiary':      '#4a0e8f',
      '--theme-gradient-mid':  '#b3e5fc',
      '--theme-bg-hint':       '#000814',
      '--theme-primary-rgb':   '128, 216, 255',
      '--theme-secondary-rgb': '200, 184, 255',
    },
    particles: ['#80d8ff', '#ffffff', '#c8b8ff', '#e0f7fa', '#b3e5fc', '#e1bee7'],
    swatches:  ['#80d8ff', '#c8b8ff', '#4a0e8f'],
  },

  'summer-solstice': {
    key:             'summer-solstice',
    name:            'Summer Vibes',
    emoji:           '☀️',
    logoText:        'Summer Vibes',
    tagline:         'Golden Season 44',
    invitesTitle:    'Summer Adventure Invites',
    invitesSubtitle: "Let's chase the sun",
    footerBrand:     'Summer Vibes',
    cssVars: {
      '--theme-primary':       '#ff6b6b',
      '--theme-secondary':     '#ffd166',
      '--theme-tertiary':      '#ff8a65',
      '--theme-gradient-mid':  '#ff9a9a',
      '--theme-bg-hint':       '#100800',
      '--theme-primary-rgb':   '255, 107, 107',
      '--theme-secondary-rgb': '255, 209, 102',
    },
    particles: ['#ff6b6b', '#ffd166', '#ff8a65', '#ffb347', '#ff4757', '#fff200'],
    swatches:  ['#ff6b6b', '#ff8a65', '#ffd166'],
  },
};

// ============================================================
// 2. APP STATE
// ============================================================
let activeTheme  = SEASON_THEMES['love-island']; // currently active season theme
let customInvites = [];                           // invites added via admin (localStorage)
let completedInviteIds = new Set();               // set of completed invite IDs


// ============================================================
// 3. THEME SYSTEM
// ============================================================

/**
 * loadTheme()
 * Reads the saved theme key from localStorage and applies it.
 * Called once on DOMContentLoaded, before anything renders.
 */
function loadTheme() {
  const savedKey = localStorage.getItem('maila_theme') || 'love-island';
  applyTheme(savedKey);
}

/**
 * applyTheme(themeKey)
 * Injects all CSS custom properties onto <html> and updates
 * every dynamic text label in the DOM.
 */
function applyTheme(themeKey) {
  const theme = SEASON_THEMES[themeKey] || SEASON_THEMES['love-island'];
  activeTheme = theme;

  // — Inject CSS variables —
  const root = document.documentElement;
  Object.entries(theme.cssVars).forEach(([prop, val]) => {
    root.style.setProperty(prop, val);
  });

  // — Update dynamic text labels —
  const ids = {
    'logo-text':            theme.logoText,
    'logo-tagline':         theme.tagline,
    'invites-title-text':   theme.invitesTitle,
    'invites-subtitle-text':theme.invitesSubtitle,
    'footer-brand':         theme.footerBrand,
  };
  Object.entries(ids).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });

  // Persist the choice for all visitors on this device
  localStorage.setItem('maila_theme', themeKey);
}

// ============================================================
// 4. LOCALSTRAGE HELPERS  (custom invites)
// ============================================================

/** Load custom invites from localStorage into state. */
function loadInvitesState() {
  const stored = localStorage.getItem('maila_custom_invites');
  if (stored) {
    try {
      customInvites = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored custom invites', e);
      customInvites = [];
    }
  } else {
    customInvites = [];
  }
}

/** Persist custom invites to localStorage. */
function saveInvitesState() {
  localStorage.setItem('maila_custom_invites', JSON.stringify(customInvites));
}

/** Load completed invite IDs from localStorage. */
function loadCompletedStates() {
  const stored = localStorage.getItem('maila_completed_ids');
  if (stored) {
    try {
      completedInviteIds = new Set(JSON.parse(stored));
    } catch (e) {
      console.error('Error parsing stored completed states', e);
      completedInviteIds = new Set();
    }
  } else {
    completedInviteIds = new Set();
  }
}

/** Save completed invite IDs to localStorage. */
function saveCompletedStates() {
  localStorage.setItem('maila_completed_ids', JSON.stringify([...completedInviteIds]));
}

/** Toggle completed state of an invitation. */
window.toggleCompleted = function (id) {
  if (completedInviteIds.has(id)) {
    completedInviteIds.delete(id);
    showToast('Invitation marked as active.', '✨');
  } else {
    completedInviteIds.add(id);
    showToast('Invitation marked as finished! ✓', '💖');
  }
  saveCompletedStates();
  renderInviteManager();
  renderInvitesFeed();
};

/**
 * getCombinedInvites()
 * Custom invites appear first (newest at top), then the hard-coded defaults.
 * To make an invite permanent for every device, copy the generated code
 * snippet into DEFAULT_INVITES below.
 */
function getCombinedInvites() {
  return [...customInvites, ...DEFAULT_INVITES];
}

// ============================================================
// DEFAULT PRESET INVITES
// ============================================================
// Paste the snippet generated by the admin exporter here to
// make any invites permanent across all devices & deployments.
const DEFAULT_INVITES = [
  {
    id: 'preset-1',
    title: 'KOP / Midterm Celebration Dinner',
    desc: 'Celebrating our 2-month anniversary from 6/4 and you finishing your Midterms — Nan Xiang Soup Dumplings - King of Prussia',
    date: 'Thursday, June 4th',
    theme: 'theme-pink-purple',
    calendar: 'https://calendar.app.google/XbxFyVpViw6EfcwU8',
  },
];

// ============================================================
// 5. TOAST SYSTEM
// ============================================================
const toastContainer = document.getElementById('toast-container');

/**
 * showToast(message, icon)
 * Renders a glassmorphic toast notification that auto-dismisses
 * after 4 seconds. Uses the active theme's primary colour for its border.
 */
function showToast(message, icon = '🔒') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  toastContainer.appendChild(toast);

  // Trigger entry animation on next paint
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 4000);
}

// ============================================================
// 6. CONFETTI & HEARTS PARTICLE SYSTEM
// ============================================================
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, color) {
    this.x     = x;
    this.y     = y;
    this.size  = Math.random() * 8 + 6;
    this.color = color;

    // Random outward velocity, biased upward
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - Math.random() * 4;

    this.alpha         = 1;
    this.decay         = Math.random() * 0.015 + 0.01;
    this.gravity       = 0.15;
    this.rotation      = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    // Mix of hearts and 4-point sparkles
    this.type = Math.random() > 0.45 ? 'heart' : 'sparkle';
  }

  update() {
    this.vy       += this.gravity;
    this.x        += this.vx;
    this.y        += this.vy;
    this.rotation += this.rotationSpeed;
    this.alpha    -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    if (this.type === 'heart') {
      const d = this.size;
      ctx.beginPath();
      ctx.moveTo(0, -d / 4);
      ctx.bezierCurveTo(-d / 2, -d / 2, -d, -d / 6, -d, d / 4);
      ctx.bezierCurveTo(-d, d * 0.7, 0, d * 1.1, 0, d * 1.25);
      ctx.bezierCurveTo(0, d * 1.1, d, d * 0.7, d, d / 4);
      ctx.bezierCurveTo(d, -d / 6, d / 2, -d / 2, 0, -d / 4);
      ctx.fill();
    } else {
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(0, 0, s, 0);
      ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s, 0);
      ctx.quadraticCurveTo(0, 0, 0, -s);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

/**
 * spawnParticleBurst(x, y, count)
 * Uses the ACTIVE THEME's particle colour palette, so the burst
 * always matches the current season (pink hearts in Love Island,
 * icy sparkles in Winter Frost, etc.).
 */
function spawnParticleBurst(x, y, count = 35) {
  const colors = activeTheme.particles;
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color));
  }
  if (!animationId) runParticleLoop();
}

function runParticleLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(runParticleLoop);
  } else {
    animationId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ============================================================
// 7. AUTHENTICATION & CLIENT-SIDE ROUTING
// ============================================================
const authOverlay   = document.getElementById('auth-overlay');
const passcodeInput = document.getElementById('passcode-input');
const unlockBtn     = document.getElementById('unlock-btn');
const errorMsg      = document.getElementById('error-msg');
const mailaPortal   = document.getElementById('maila-portal');
const adminPortal   = document.getElementById('admin-portal');

/** Validate the entered passcode and route to the correct view. */
function attemptUnlock() {
  const code = passcodeInput.value.trim().toUpperCase();

  if (code === 'MJ44') {
    transitionScreen(mailaPortal);
    sessionStorage.setItem('portal_session', 'maila');
    renderInvitesFeed();
    showToast('Welcome back, Maila! 💖', '🌴');

  } else if (code === 'JM44') {
    transitionScreen(adminPortal);
    sessionStorage.setItem('portal_session', 'admin');
    renderAdminPanel();
    showToast('Admin access authorized.', '⚙️');

  } else {
    // Shake the card and show the error message
    errorMsg.classList.add('visible');
    const card = document.querySelector('.auth-card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 450);

    passcodeInput.value = '';
    passcodeInput.focus();
  }
}

/** Fade out the auth overlay and reveal the target portal. */
function transitionScreen(targetPortal) {
  authOverlay.style.opacity = '0';
  setTimeout(() => {
    authOverlay.classList.add('hidden');
    targetPortal.classList.remove('hidden');
    window.scrollTo({ top: 0 });
  }, 600);
}

passcodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') attemptUnlock();
});
unlockBtn.addEventListener('click', attemptUnlock);

/** On page load: apply theme first, then restore any active session. */
window.addEventListener('DOMContentLoaded', () => {
  // Theme MUST be applied before session restore so labels are correct
  loadTheme();
  loadInvitesState();
  loadCompletedStates();

  // Clear legacy localStorage session if present to force clean start
  if (localStorage.getItem('portal_session')) {
    localStorage.removeItem('portal_session');
  }

  const session = sessionStorage.getItem('portal_session');
  if (session === 'maila') {
    authOverlay.classList.add('hidden');
    mailaPortal.classList.remove('hidden');
    renderInvitesFeed();
  } else if (session === 'admin') {
    authOverlay.classList.add('hidden');
    adminPortal.classList.remove('hidden');
    renderAdminPanel();
  } else {
    setTimeout(() => passcodeInput.focus(), 100);
  }
});

// Sync data & theme updates across multiple open tabs/windows
window.addEventListener('storage', (e) => {
  if (e.key === 'maila_custom_invites' || e.key === 'maila_completed_ids' || e.key === 'maila_theme') {
    loadTheme();
    loadInvitesState();
    loadCompletedStates();
    renderInvitesFeed();
    if (adminPortal && !adminPortal.classList.contains('hidden')) {
      renderAdminPanel();
    }
  }
});

/** Lock the app and return to the auth screen. */
function lockApp() {
  sessionStorage.removeItem('portal_session');
  location.reload();
}

document.getElementById('portal-logout').addEventListener('click', (e) => {
  e.preventDefault();
  lockApp();
});
document.getElementById('admin-logout').addEventListener('click', lockApp);

// ============================================================
// 8. MAILA'S PORTAL RENDERING
// ============================================================
const invitesSection = document.getElementById('invites-section');
const invitesGrid    = document.getElementById('invites-grid');

// Toggle invite section visibility when the Invites card is clicked
document.getElementById('action-invites').addEventListener('click', () => {
  const isHidden = invitesSection.classList.contains('hidden');
  invitesSection.classList.toggle('hidden', !isHidden);
  if (isHidden) {
    setTimeout(() => {
      invitesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
});

// Locked cards show a "Coming Soon in Season 2" toast using the active theme emoji
document.querySelectorAll('.action-card.locked').forEach((card) => {
  card.addEventListener('click', () => {
    showToast(`Coming soon in Season 2! 🔒`, activeTheme.emoji);
  });
});

/** Render all invites (custom + defaults) into the invites grid. */
function renderInvitesFeed() {
  const invites = getCombinedInvites();
  invitesGrid.innerHTML = '';

  if (invites.length === 0) {
    invitesGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-secondary);">
        <p>No date night invitations active yet. Stay tuned!</p>
      </div>`;
    return;
  }

  invites.forEach((invite) => {
    const themeClass = invite.theme || 'theme-pink-purple';
    const isCompleted = completedInviteIds.has(invite.id);

    // Badge text depends on the invite card colour theme (not the site season)
    const badges = {
      'theme-pink-purple': 'LOVE ISLAND SPECIAL 44',
      'theme-cyan-blue':   'MOONLIGHT VIP 44',
      'theme-gold-orange': 'TROPICAL NIGHTS 44',
    };
    const badgeText = badges[themeClass] || 'DATE NIGHT';

    let acceptBtnHtml = '';
    if (isCompleted) {
      acceptBtnHtml = `
        <button class="invite-btn btn-accept" style="background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); border: 1px solid rgba(255, 255, 255, 0.08); cursor: default;" disabled>
          COMPLETED DATE ✓
        </button>
      `;
    } else {
      acceptBtnHtml = `
        <button class="invite-btn btn-accept"
                onclick="acceptInvitation(event, '${invite.title.replace(/'/g, "\\'")}')">
          ACCEPT INVITE 💖
        </button>
      `;
    }

    invitesGrid.insertAdjacentHTML('beforeend', `
      <div class="invite-card ${themeClass} ${isCompleted ? 'completed' : ''}" id="card-${invite.id}">
        <div class="invite-card-bg"></div>
        <div class="invite-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 1.25rem;">
            <span class="invite-badge" style="margin-bottom: 0;">${badgeText}</span>
            ${isCompleted ? '<span class="invite-completed-badge">✓ Completed</span>' : ''}
          </div>
          <h3 class="invite-title-text">${invite.title}</h3>
          <p class="invite-desc-text">${invite.desc}</p>
        </div>
        <div class="invite-footer">
          <div class="invite-info-row">
            <span class="invite-info-icon">📅</span>
            <span>${invite.date}</span>
          </div>
          ${acceptBtnHtml}
          <a href="${invite.calendar}"
             target="_blank"
             rel="noopener noreferrer"
             class="invite-btn btn-calendar">
            ADD TO CALENDAR 📅
          </a>
        </div>
      </div>
    `);
  });
}

/** Trigger heart/sparkle burst and a toast when an invite is accepted. */
window.acceptInvitation = function (event, title) {
  const rect  = event.target.getBoundingClientRect();
  spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
  showToast(`You accepted: "${title}"! Can't wait for our date! 🥰`, '💌');
};

// ============================================================
// 9. ADMIN PANEL RENDERING
// ============================================================

/** Render the full admin panel: theme selector + invite manager + exporter. */
function renderAdminPanel() {
  renderThemePanel();
  renderInviteManager();
}

// ── 9a. THEME SELECTOR PANEL ─────────────────────────────────

/**
 * renderThemePanel()
 * Populates the #admin-theme-panel section with interactive
 * theme cards, one per entry in SEASON_THEMES.
 */
function renderThemePanel() {
  const panel = document.getElementById('admin-theme-panel');
  if (!panel) return;

  const currentKey = activeTheme.key;

  panel.innerHTML = `
    <h2 class="admin-section-title">
      <span style="color:var(--theme-primary);">✦</span> Site Season Theme
    </h2>
    <p class="action-desc" style="margin-bottom:1.5rem;">
      Switch the entire site's colours, labels, and particle effects for any season.
      Changes are instant and persist for all visitors on this device.
    </p>
    <div class="theme-selector-grid">
      ${Object.values(SEASON_THEMES).map((t) => `
        <div class="theme-card ${t.key === currentKey ? 'theme-card-active' : ''}"
             data-theme-key="${t.key}"
             onclick="selectTheme('${t.key}')">
          <div class="theme-card-swatches">
            ${t.swatches.map((s) => `<span class="theme-swatch" style="background:${s};"></span>`).join('')}
          </div>
          <div class="theme-card-emoji">${t.emoji}</div>
          <div class="theme-card-name">${t.name}</div>
          ${t.key === currentKey ? '<div class="theme-card-active-badge">ACTIVE</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * selectTheme(themeKey)
 * Called when an admin clicks a theme card. Applies immediately.
 */
window.selectTheme = function (themeKey) {
  applyTheme(themeKey);
  renderThemePanel();      // refresh active badge
  showToast(
    `Theme switched to ${SEASON_THEMES[themeKey].name} ${SEASON_THEMES[themeKey].emoji}`,
    '🎨',
  );
};

// ── 9b. INVITE MANAGER PANEL ─────────────────────────────────

const inviteForm = document.getElementById('invite-form');

inviteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newInvite = {
    id:       'custom-' + Date.now(),
    title:    document.getElementById('invite-title').value.trim(),
    desc:     document.getElementById('invite-desc').value.trim(),
    date:     document.getElementById('invite-date').value.trim(),
    theme:    document.getElementById('invite-theme').value,
    calendar: document.getElementById('invite-calendar').value.trim(),
  };

  customInvites.unshift(newInvite);
  saveInvitesState();
  renderInviteManager();
  renderInvitesFeed(); // Update Maila's feed immediately on publish
  inviteForm.reset();
  showToast('New invitation published!', '✨');
});

/** Render the live invites list (presets + custom) and refresh the code exporter. */
function renderInviteManager() {
  const listEl = document.getElementById('custom-invites-list');
  if (!listEl) return;

  listEl.innerHTML = '';

  const allInvites = getCombinedInvites();

  if (allInvites.length === 0) {
    listEl.innerHTML = `
      <div class="no-custom-invites">
        No invitations active. Use the form to add one!
      </div>`;
  } else {
    const themeLabels = {
      'theme-pink-purple': 'Pink Glow',
      'theme-cyan-blue':   'Cyan Glow',
      'theme-gold-orange': 'Gold Glow',
    };

    allInvites.forEach((invite) => {
      const isCompleted = completedInviteIds.has(invite.id);
      const isPreset = invite.id.startsWith('preset-');
      
      const row = document.createElement('div');
      row.className = `custom-invite-row ${isCompleted ? 'completed' : ''}`;
      row.innerHTML = `
        <div class="custom-invite-info">
          <div class="custom-invite-title">
            ${invite.title}
            <span class="invite-source-tag">${isPreset ? 'Preset' : 'Custom'}</span>
          </div>
          <div class="custom-invite-meta">
            ${invite.date} &bull; ${themeLabels[invite.theme] || invite.theme}
          </div>
        </div>
        <div class="custom-invite-actions">
          <button class="custom-invite-action-btn btn-done ${isCompleted ? 'active' : ''}"
                  onclick="toggleCompleted('${invite.id}')"
                  title="${isCompleted ? 'Mark as Active' : 'Mark as Finished'}">
            ✓
          </button>
          ${!isPreset ? `
            <button class="custom-invite-action-btn btn-delete"
                    onclick="deleteCustomInvite('${invite.id}')"
                    title="Delete invite">
              🗑️
            </button>
          ` : `
            <button class="custom-invite-action-btn btn-delete" 
                    style="opacity: 0.3; cursor: not-allowed;" 
                    disabled 
                    title="Preset invitations cannot be deleted">
              🗑️
            </button>
          `}
        </div>
      `;
      listEl.appendChild(row);
    });
  }
}

window.deleteCustomInvite = function (id) {
  customInvites = customInvites.filter((inv) => inv.id !== id);
  // Also clean up completed status if deleted
  completedInviteIds.delete(id);
  saveCompletedStates();
  saveInvitesState();
  renderInviteManager();
  renderInvitesFeed(); // Update Maila's feed immediately on delete
  showToast('Invitation deleted.', '🗑️');
};
