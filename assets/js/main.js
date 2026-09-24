
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const progress = $('.top-progress');
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  // Mobile utility navigation.
  const toggle = $('.menu-toggle');
  const links = $('.utility-links');
  if (toggle && links) toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Active navigation.
  const path = location.pathname.replace(/\/$/, '') || '/';
  $$('.utility-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href))) a.setAttribute('aria-current', 'page');
  });

  // Real MPA transitions.
  $$('a[href^="/"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('/#') || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (progress) { progress.style.opacity = '1'; progress.style.width = '72%'; }
      document.body.classList.add('page-exit');
      setTimeout(() => { if (progress) progress.style.width = '100%'; location.href = href; }, 180);
    });
  });
  window.addEventListener('pageshow', () => { if (progress) { progress.style.width = '100%'; setTimeout(() => progress.style.opacity = '0', 350); } });

  // Reveal motion.
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => observer.observe(el));

  // Cookie consent.
  const cookieKey = 'vf-cookie-choice';
  const banner = $('.cookie-banner');
  const modal = $('.modal-backdrop');
  const showModal = () => { if (modal) { modal.hidden = false; const close = $('.modal-close', modal); close && close.focus(); } };
  const hideModal = () => { if (modal) modal.hidden = true; };
  if (banner && !localStorage.getItem(cookieKey)) banner.hidden = false;
  $$('.cookie-action').forEach(btn => btn.addEventListener('click', () => {
    const value = btn.dataset.cookie || 'essential'; localStorage.setItem(cookieKey, value); if (banner) banner.hidden = true; if (modal) modal.hidden = true;
  }));
  $$('.cookie-settings').forEach(btn => btn.addEventListener('click', showModal));
  $$('.modal-close').forEach(btn => btn.addEventListener('click', hideModal));
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) hideModal(); });

  // Public call readiness tool.
  const toolForm = $('#readiness-form');
  if (toolForm) {
    const result = $('#tool-result');
    toolForm.addEventListener('submit', e => {
      e.preventDefault();
      const business = $('#business-type').value.trim();
      const goal = $('#call-goal').value.trim();
      const transfer = $('#transfer-rule').value.trim();
      const button = $('button[type="submit"]', toolForm);
      if (!business || !goal || !transfer) return;
      button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking call flow…';
      result.hidden = true;
      setTimeout(() => {
        const score = Math.min(96, 58 + (business.length > 3 ? 12 : 0) + (goal.length > 12 ? 17 : 0) + (transfer.length > 12 ? 9 : 0));
        $('#score-number').textContent = score;
        $('#result-title').textContent = score >= 84 ? 'Ready for a first agent build' : 'A clear starting point is available';
        $('#result-copy').textContent = 'Your call flow has a defined audience, objective, and handoff rule. Turn these inputs into an agent brief before connecting a phone number.';
        result.hidden = false; button.disabled = false; button.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Check readiness';
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 720);
    });
  }

  // Form helpers.
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const setError = (field, message) => { const wrap = field.closest('.field'); if (!wrap) return; wrap.classList.toggle('has-error', !!message); const err = $('.error-text', wrap); if (err) err.textContent = message || ''; field.setAttribute('aria-invalid', message ? 'true' : 'false'); };
  const requiredEmail = field => emailRe.test(field.value.trim()) ? '' : 'Enter a valid email address';

  // Registration.
  const register = $('#register-form');
  if (register) {
    const name = $('#full-name'), email = $('#register-email'), pass = $('#register-password'), confirm = $('#confirm-password'), terms = $('#terms-check'), submit = $('button[type="submit"]', register);
    const rules = { length: $('#rule-length'), upper: $('#rule-upper'), number: $('#rule-number') };
    const meter = $('#password-meter');
    const validate = (live = false) => {
      let ok = true;
      if (live || name.dataset.touched) { const m = name.value.trim().length >= 2 && !/^\d+$/.test(name.value.trim()) ? '' : 'Enter your full name'; setError(name, m); ok = ok && !m; }
      if (live || email.dataset.touched) { const m = requiredEmail(email); setError(email, m); ok = ok && !m; }
      const v = pass.value; const checks = { length: v.length >= 8, upper: /[A-Z]/.test(v), number: /\d/.test(v) };
      Object.entries(checks).forEach(([k, valid]) => rules[k] && rules[k].classList.toggle('valid', valid));
      if (meter) { const count = Object.values(checks).filter(Boolean).length; meter.style.width = `${count * 33.333}%`; meter.style.background = count === 3 ? 'var(--success)' : count === 2 ? 'var(--orange)' : 'var(--danger)'; }
      if (live || pass.dataset.touched) { const m = checks.length && checks.upper && checks.number ? '' : 'Use 8+ characters, one uppercase letter, and one number'; setError(pass, m); ok = ok && !m; }
      if (live || confirm.dataset.touched) { const m = confirm.value === pass.value && confirm.value ? '' : "Passwords don't match"; setError(confirm, m); ok = ok && !m; }
      if (live || terms.dataset.touched) { const m = terms.checked ? '' : 'You must accept the Terms of Service to continue'; setError(terms, m); ok = ok && !m; }
      submit.disabled = !(ok && name.value.trim() && emailRe.test(email.value.trim()) && pass.value && confirm.value === pass.value && terms.checked);
      return ok;
    };
    [name, email, pass, confirm].forEach(field => { field.addEventListener('blur', () => { field.dataset.touched = '1'; validate(); }); field.addEventListener('input', () => validate(true)); });
    terms.addEventListener('change', () => { terms.dataset.touched = '1'; validate(true); });
    $$('.password-toggle', register).forEach(btn => btn.addEventListener('click', () => { pass.type = pass.type === 'password' ? 'text' : 'password'; btn.innerHTML = `<i class="fa-solid fa-eye${pass.type === 'password' ? '' : '-slash'}"></i>`; }));
    register.addEventListener('submit', e => { e.preventDefault(); if (!validate(true)) return; submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account…'; $$('input, button', register).forEach(x => x.disabled = true); sessionStorage.setItem('vf-email', email.value.trim()); setTimeout(() => location.href = '/verify', 1050); });
  }

  // Login: validation succeeds, authentication always returns an account error.
  const login = $('#login-form');
  if (login) {
    const email = $('#login-email'), pass = $('#login-password'), alert = $('#login-alert'), submit = $('button[type="submit"]', login); let attempts = Number(sessionStorage.getItem('vf-login-attempts') || 0); let cooldown = 0;
    login.addEventListener('submit', e => { e.preventDefault(); setError(email, requiredEmail(email)); setError(pass, pass.value ? '' : 'Enter your password'); if (!emailRe.test(email.value.trim()) || !pass.value) return; if (cooldown) return; submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in…'; email.disabled = pass.disabled = true; setTimeout(() => { attempts += 1; sessionStorage.setItem('vf-login-attempts', attempts); pass.value = ''; email.disabled = pass.disabled = false; submit.disabled = false; submit.innerHTML = 'Sign in'; alert.hidden = false; alert.textContent = attempts >= 3 ? 'Too many failed attempts. Try again in 30 seconds.' : 'We could not find an account with those details.'; login.classList.add('shake'); setTimeout(() => login.classList.remove('shake'), 320); if (attempts >= 3) { cooldown = 30; submit.disabled = true; const tick = setInterval(() => { cooldown -= 1; alert.textContent = `Too many failed attempts. Try again in ${cooldown} seconds.`; if (!cooldown) { clearInterval(tick); submit.disabled = false; alert.hidden = true; } }, 1000); } }, 1150); });
  }

  // Forgot password.
  const forgot = $('#forgot-form');
  if (forgot) forgot.addEventListener('submit', e => { e.preventDefault(); const email = $('#forgot-email'), box = $('#forgot-success'); setError(email, requiredEmail(email)); if (!emailRe.test(email.value.trim())) return; box.hidden = false; box.textContent = `If an account exists for ${email.value.trim()}, you'll receive a reset link shortly.`; });

  // Verification code page.
  const verify = $('#verify-form');
  if (verify) {
    const email = sessionStorage.getItem('vf-email'); const emailEl = $('#verify-email'); if (emailEl) emailEl.textContent = email || 'your email address';
    const inputs = $$('.otp input', verify), resend = $('#resend-code'), countdown = $('#countdown'), alert = $('#verify-alert'), submit = $('button[type="submit"]', verify); let resendCount = 0, endAt = Date.now() + 60000;
    const clearCode = () => inputs.forEach(i => { i.value = ''; i.disabled = false; });
    const startTimer = seconds => { endAt = Date.now() + seconds * 1000; resend.disabled = true; const tick = () => { const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); countdown.textContent = remaining ? `Resend code in 0:${String(remaining).padStart(2,'0')}` : "Didn't get the code?"; if (!remaining) { resend.disabled = resendCount >= 3; if (resendCount < 3) resend.textContent = 'Resend'; } else requestAnimationFrame(() => setTimeout(tick, 250)); }; tick(); };
    const submitCode = () => { const code = inputs.map(i => i.value).join(''); if (code.length !== 6) { alert.hidden = false; alert.textContent = 'Enter the 6-digit code'; return; } alert.hidden = true; inputs.forEach(i => i.disabled = true); submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying…'; setTimeout(() => location.href = '/loading', 950); };
    inputs.forEach((input, idx) => { input.addEventListener('input', () => { input.value = input.value.replace(/\D/g,'').slice(-1); if (input.value && inputs[idx+1]) inputs[idx+1].focus(); if (inputs.every(i => i.value)) submitCode(); }); input.addEventListener('keydown', e => { if (e.key === 'Backspace' && !input.value && inputs[idx-1]) inputs[idx-1].focus(); if (e.key === 'ArrowLeft' && inputs[idx-1]) inputs[idx-1].focus(); if (e.key === 'ArrowRight' && inputs[idx+1]) inputs[idx+1].focus(); }); input.addEventListener('paste', e => { e.preventDefault(); const digits = (e.clipboardData.getData('text') || '').replace(/\D/g,'').slice(0,6); digits.split('').forEach((d, i) => { if (inputs[i]) inputs[i].value = d; }); inputs[Math.min(digits.length, 5)].focus(); if (digits.length === 6) submitCode(); }); });
    resend.addEventListener('click', () => { if (resend.disabled) return; resendCount += 1; resend.disabled = true; resend.textContent = 'Sending…'; setTimeout(() => { alert.hidden = false; alert.textContent = `A new code has been sent to ${email || 'your email address'}`; clearCode(); inputs[0].focus(); if (resendCount >= 3) { countdown.textContent = "You've reached the maximum number of resend attempts."; resend.textContent = 'Resend unavailable'; } else { resend.textContent = 'Resend'; startTimer(resendCount === 1 ? 120 : 300); } }, 650); });
    verify.addEventListener('submit', e => { e.preventDefault(); submitCode(); }); startTimer(60); inputs[0].focus();
  }
})();
