const fs = require('fs');

let html = fs.readFileSync('d:\\backend (3)\\public\\live-session\\thankyou.html', 'utf8');

const mapping = {
  'page': 'relative z-10 w-full flex flex-col gap-[22px] px-7 py-7 pb-14 mx-auto max-w-7xl',
  'bg-wrap': 'fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_-10%_-10%,#0e2535_0%,transparent_55%),radial-gradient(ellipse_100%_70%_at_110%_110%,#0c1e10_0%,transparent_50%),linear-gradient(180deg,#07111c_0%,#060e18_100%)]',
  'hero': 'relative overflow-hidden rounded-[28px] grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-[40px] px-[22px] py-[28px] md:px-[52px] md:py-[48px] border border-[#2bb7a5]/20 bg-[linear-gradient(125deg,#0e2535_0%,#091a28_45%,#0d2232_100%)] shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(43,183,165,0.08),inset_0_1px_0_rgba(255,255,255,0.07)]',
  'hero-icon-wrap': 'relative w-[80px] h-[80px] shrink-0 mb-6',
  'hero-icon-ring': 'w-[80px] h-[80px] rounded-full border-2 border-teal grid place-items-center relative z-10 bg-[linear-gradient(135deg,rgba(43,183,165,0.2),rgba(43,183,165,0.05))]',
  'hero-tag': 'inline-flex items-center gap-[7px] rounded-full px-3 py-1.5 pl-2 text-[11px] font-bold tracking-[0.09em] uppercase text-teal mb-[14px] bg-[#2bb7a5]/10 border border-[#2bb7a5]/30',
  'hero-tag-dot': 'w-[18px] h-[18px] rounded-full bg-teal grid place-items-center text-white text-[9px]',
  'hero-title': 'font-display text-[30px] md:text-[clamp(32px,4vw,44px)] text-white leading-[1.1] mb-3 drop-shadow-[0_2px_15px_rgba(240,192,96,0.35)]',
  'hero-sub': 'text-[14px] leading-[1.7] text-white/65 max-w-[500px] mb-8',
  'hero-stats': 'flex flex-wrap items-center gap-6',
  'hstat': 'flex items-center gap-3',
  'hstat-icon': 'w-10 h-10 rounded-full flex items-center justify-center text-[15px] border border-transparent',
  'hsi-t': 'bg-[#2bb7a5]/10 border-[#2bb7a5]/25 text-teal',
  'hsi-g': 'bg-[#f0c060]/10 border-[#f0c060]/25 text-gold',
  'hstat-label': 'text-[10px] uppercase font-bold tracking-[0.1em] text-white/50 mb-[2px]',
  'hstat-val': 'text-[12px] md:text-[14px] font-bold text-white',
  'seal-wrap': 'flex-col items-center gap-[14px] relative z-10 hidden md:flex',
  'seal-outer': 'w-[140px] h-[140px] rounded-full grid place-items-center relative border-2 border-[#f0c060]/40 shadow-[0_0_0_10px_rgba(240,192,96,0.06),0_0_60px_rgba(240,192,96,0.18)] bg-[radial-gradient(circle,rgba(240,192,96,0.1)_0%,transparent_70%)]',
  'seal-label': 'text-[12px] font-bold text-center text-gold leading-[1.5] tracking-[0.04em]',
  'bento': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_380px] gap-3 md:gap-[18px]',
  'gc': 'bg-white/5 border border-white/10 rounded-[24px] overflow-hidden transition-all duration-[400ms] ease-out hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
  'gc-pad': 'p-6 lg:p-[32px]',
  'gc-title': 'flex items-center gap-[10px] font-display text-[22px] text-white mb-2',
  'gc-icon': 'w-[36px] h-[36px] rounded-[10px] grid place-items-center text-[15px] shrink-0',
  'gci-t': 'bg-[#2bb7a5]/20 text-teal',
  'gci-g': 'bg-[#f0c060]/20 text-gold',
  'gci-gr': 'bg-[#4ade80]/15 text-[#4ade80]',
  'gci-b': 'bg-[#60a5fa]/15 text-[#60a5fa]',
  'gc-journey': 'col-span-1 md:col-span-2',
  'journey-steps': 'flex items-start gap-0 relative',
  'j-step': 'flex-1 flex flex-col items-center text-center relative z-10 px-2.5',
  'j-icon': 'w-[64px] h-[64px] rounded-[18px] grid place-items-center text-[26px] border border-white/10 mb-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-105',
  'ji-a': 'bg-[linear-gradient(135deg,rgba(240,192,96,0.22),rgba(240,192,96,0.06))] text-gold',
  'ji-t': 'bg-[linear-gradient(135deg,rgba(43,183,165,0.22),rgba(43,183,165,0.06))] text-teal',
  'ji-b': 'bg-[linear-gradient(135deg,rgba(96,165,250,0.2),rgba(96,165,250,0.05))] text-[#60a5fa]',
  'j-num': 'text-[9px] font-extrabold tracking-[0.1em] uppercase text-teal mb-[5px]',
  'j-label': 'text-[12px] font-bold text-white mb-1',
  'j-desc': 'text-[10px] leading-[1.5] text-white/65',
  'j-connector': 'flex-none w-[60px] flex-col items-center mt-[32px] relative z-0 hidden sm:flex',
  'j-line': 'h-[2px] w-full bg-[linear-gradient(90deg,#2bb7a5,#f0c060)] bg-[length:200%_100%]',
  'j-arrow': 'text-[10px] text-gold mt-1 opacity-60',
  'includes-grid': 'grid grid-cols-2 gap-2.5',
  'inc-item': 'bg-white/5 border border-white/10 rounded-[14px] p-3.5 text-center transition-all duration-300 hover:bg-[#2bb7a5]/10 hover:border-[#2bb7a5]/30 hover:-translate-y-1',
  'gc-notice': 'col-span-1 md:col-span-2 lg:col-span-1 bg-[linear-gradient(135deg,rgba(240,192,96,0.07),rgba(240,192,96,0.03))] border-[#f0c060]/20 flex items-center gap-4',
  'gc-stats': 'col-span-1 md:col-span-2 lg:col-span-2 bg-[linear-gradient(135deg,rgba(43,183,165,0.07),rgba(43,183,165,0.03))] border-[#2bb7a5]/15',
  'stats-row': 'flex flex-wrap gap-0',
  'stat-item': 'flex-1 min-w-[50%] md:min-w-0 py-4 px-5 border-r border-white/5 last:border-r-0 text-center transition-colors hover:bg-[#2bb7a5]/10',
  'stat-num': 'font-display text-[28px] text-gold drop-shadow-[0_2px_14px_rgba(240,192,96,0.35)] leading-none mb-1',
  'stat-lbl': 'text-[10px] font-semibold text-white/65 uppercase tracking-[0.07em]',
  'gc-team': 'col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 bg-[linear-gradient(160deg,#0f2840_0%,#091a28_100%)] border-[#2bb7a5]/25 flex flex-col items-center justify-center text-center p-7 relative overflow-hidden',
  'team-badge': 'absolute top-[18px] right-[18px] bg-[#2bb7a5]/15 border border-[#2bb7a5]/30 rounded-full px-[11px] py-[3px] text-[8.5px] font-extrabold tracking-[0.12em] uppercase text-teal',
  'orbital': 'relative w-[190px] h-[190px] mx-auto mb-[26px]',
  'team-chip': 'inline-block bg-[#2bb7a5]/10 border border-[#2bb7a5]/25 rounded-full px-3.5 py-1 text-[9.5px] font-bold tracking-[0.12em] uppercase text-teal mb-3',
  'team-title': 'font-display text-[clamp(20px,2.5vw,28px)] text-white leading-[1.2] mb-2.5',
  'team-desc': 'text-[12.5px] leading-[1.7] text-white/65 mb-[22px]',
  'time-box': 'w-full bg-white/5 border border-white/10 rounded-[14px] px-5 py-3.5 mb-5',
  'time-box-label': 'text-[9.5px] font-semibold text-white/65 uppercase tracking-[0.1em] mb-1',
  'time-box-value': 'font-display text-[30px] text-gold drop-shadow-[0_2px_20px_rgba(240,192,96,0.35)]',
  'btn-wa': 'flex items-center justify-center gap-2.5 w-full bg-gradient-to-br from-[#128c7e] to-[#075e54] text-white font-sans text-[14px] font-bold px-5 py-3.5 rounded-[14px] border border-white/10 shadow-[0_8px_28px_rgba(7,94,84,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-[350ms] ease-out mb-3 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(7,94,84,0.65),inset_0_1px_0_rgba(255,255,255,0.22)]',
  'btn-back': 'flex items-center justify-center gap-2 w-full text-[12px] font-semibold text-teal py-[9px] px-4 rounded-[11px] border border-[#2bb7a5]/25 transition-all duration-300 hover:bg-[#2bb7a5]/10 hover:border-[#2bb7a5]/30 hover:-translate-y-[1px]',
  'demo-section': 'bg-white/5 border border-white/10 rounded-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden',
  'demo-head': 'flex items-center justify-between px-7 py-5 border-b border-white/5 bg-[#2bb7a5]/5',
  'demo-head-left': 'flex items-center gap-3.5',
  'demo-live-dot': 'w-2.5 h-2.5 rounded-full bg-teal shadow-[0_0_0_3px_rgba(43,183,165,0.2)] shrink-0',
  'demo-head-tag': 'text-[10px] font-bold tracking-[0.08em] uppercase bg-[#f0c060]/15 border border-[#f0c060]/25 text-gold rounded-full px-3 py-1',
  'demo-cards': 'grid grid-cols-1 md:grid-cols-3',
  'demo-card': 'p-6 md:p-7 md:border-r border-white/5 transition-colors duration-300 relative overflow-hidden hover:bg-[#2bb7a5]/10 group',
  'demo-card-icon': 'w-12 h-12 rounded-[14px] grid place-items-center text-[20px] mb-4',
  'dci-t': 'bg-[#2bb7a5]/20 text-teal',
  'dci-g': 'bg-[#f0c060]/20 text-gold',
  'demo-card-link': 'inline-flex items-center gap-1.5 mt-3.5 text-[11px] font-bold text-teal transition-[gap] duration-300 group-hover:gap-2.5'
};

for (const [cls, tailwind] of Object.entries(mapping)) {
  const regex = new RegExp(`class="([^"]*?)\\\\b${cls}\\\\b([^"]*?)"`, 'g');
  html = html.replace(regex, (match, p1, p2) => {
    let newClass = `${p1}${tailwind}${p2}`.replace(/\\s+/g, ' ').trim();
    return `class="${newClass}"`;
  });
}

// Remove the converted classes from the style block
const classesToRemove = Object.keys(mapping);
classesToRemove.forEach(cls => {
  // Regex to remove .class { ... } block (even with @apply)
  const blockRegex = new RegExp(`\\\\.${cls}\\\\s*\\\\{[^}]*\\\\}`, 'g');
  html = html.replace(blockRegex, '');
});

fs.writeFileSync('d:\\backend (3)\\public\\live-session\\thankyou.html', html);
console.log('done');
