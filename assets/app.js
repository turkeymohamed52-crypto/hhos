(() => {
  'use strict';

  const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const toAr = (value) => String(value).replace(/\d/g, (digit) => AR_DIGITS[Number(digit)]);
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUDIO_BASE = 'https://everyayah.com/data/Alafasy_128kbps/';

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be unavailable; local features still work for this visit */
    }
  }

  function vibrate(pattern) {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  }

  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand('copy');
        area.remove();
        return copied;
      } catch {
        return false;
      }
    }
  }

  /* ---------- Header & mobile navigation ---------- */
  const header = $('#siteHeader');
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  function openMenu() {
    if (!menuToggle || !mobileNav) return;
    mobileNav.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'إغلاق القائمة');
  }

  function closeMenu() {
    if (!menuToggle || !mobileNav || mobileNav.hidden) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'فتح القائمة');
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      if (menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      } else {
        openMenu();
      }
    });

    $$('.mobile-link', mobileNav).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
      if (header && !header.contains(event.target)) closeMenu();
    });

    const desktopQuery = window.matchMedia('(min-width: 961px)');
    const handleDesktop = (event) => {
      if (event.matches) closeMenu();
    };
    if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', handleDesktop);
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Scroll spy ---------- */
  const navLinks = $$('.main-nav .nav-link');
  const spySections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
    );
    spySections.forEach((section) => spy.observe(section));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealElements = $$('.reveal');
  if (prefersReduced) {
    revealElements.forEach((element) => element.classList.add('is-in'));
  } else if ('IntersectionObserver' in window) {
    revealElements.forEach((element) => {
      const parent = element.parentElement;
      const siblings = parent
        ? Array.from(parent.children).filter((child) => child.classList.contains('reveal'))
        : [];
      const index = siblings.indexOf(element);
      if (index > 0) {
        element.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 70}ms`);
      }
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-in'));
  }

  /* ---------- Hero stars ---------- */
  const starField = $('#starField');
  if (starField) {
    for (let i = 0; i < 32; i += 1) {
      const star = document.createElement('span');
      star.className = 'hero-star';
      star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
      star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
      star.style.setProperty('--size', `${(Math.random() * 1.8 + 1).toFixed(1)}px`);
      star.style.setProperty('--dur', `${(3.5 + Math.random() * 4).toFixed(1)}s`);
      star.style.setProperty('--delay', `${(Math.random() * 5).toFixed(1)}s`);
      star.style.setProperty('--peak', (0.25 + Math.random() * 0.5).toFixed(2));
      starField.appendChild(star);
    }
  }

  /* ---------- Back to top ---------- */
  const backToTop = $('#backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 700);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Copy duas ---------- */
  $$('.copy-dua').forEach((button) => {
    button.addEventListener('click', async () => {
      const card = button.closest('.dua-card');
      const text = card ? $('.dua-text', card) : null;
      if (!text) return;
      const copied = await copyText(text.innerText.trim());
      if (!copied) {
        showToast('تعذّر النسخ — جرّب مرة أخرى');
        return;
      }
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'تم نسخ الدعاء');
      showToast('تم نسخ الدعاء — شاركه مع من يحبها');
      window.setTimeout(() => {
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', 'نسخ الدعاء');
      }, 2200);
    });
  });

  /* ---------- Share ---------- */
  const shareUrl = () => window.location.href.split('#')[0];
  const shareMessage = () =>
    `صدقة جارية على روح المرحومة «هناء محمود عبدالله»\nاقرأ لها قرآنًا، وادعُ لها بظهر الغيب:\n${shareUrl()}`;

  const whatsappBtn = $('#shareWhatsapp');
  const facebookBtn = $('#shareFacebook');
  const copyLinkBtn = $('#copyLink');

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage())}`, '_blank', 'noopener');
    });
  }

  if (facebookBtn) {
    facebookBtn.addEventListener('click', () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`,
        '_blank',
        'noopener'
      );
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      const copied = await copyText(shareUrl());
      showToast(copied ? 'تم نسخ رابط الموقع — شاركه مع من يحبها' : 'تعذّر النسخ — جرّب مرة أخرى');
    });
  }

  /* ---------- Tasbih ---------- */
  const TASBIH_KEY = 'sadaqah-tasbih-v1';
  const PHRASES = {
    subhan: { text: 'سُبْحَانَ الله', target: 33 },
    hamd: { text: 'الحَمْدُ لِله', target: 33 },
    akbar: { text: 'اللهُ أَكْبَر', target: 34 },
    tahlil: { text: 'لَا إِلَهَ إِلَّا الله', target: 100 },
    istighfar: { text: 'أَسْتَغْفِرُ الله', target: 100 },
    salah: { text: 'الصَّلَاةُ عَلَى النَّبِيّ', target: 100 },
  };

  const savedTasbih = readStorage(TASBIH_KEY, {});
  const tasbihState = {
    active: PHRASES[savedTasbih.active] ? savedTasbih.active : 'subhan',
    counts: savedTasbih.counts && typeof savedTasbih.counts === 'object' ? savedTasbih.counts : {},
    rounds: savedTasbih.rounds && typeof savedTasbih.rounds === 'object' ? savedTasbih.rounds : {},
  };

  const tasbihBtn = $('#tasbihBtn');
  const tasbihPhrase = $('#tasbihPhrase');
  const tasbihCount = $('#tasbihCount');
  const tasbihTarget = $('#tasbihTarget');
  const tasbihRounds = $('#tasbihRounds');
  const tasbihRing = $('#tasbihRing');
  const tasbihReset = $('#tasbihReset');
  const tasbihChips = $$('.dhikr-chip');
  let tasbihCompleting = false;

  function saveTasbih() {
    writeStorage(TASBIH_KEY, {
      active: tasbihState.active,
      counts: tasbihState.counts,
      rounds: tasbihState.rounds,
    });
  }

  function renderTasbih() {
    if (!tasbihBtn) return;
    const phrase = PHRASES[tasbihState.active];
    const count = tasbihState.counts[tasbihState.active] || 0;
    const rounds = tasbihState.rounds[tasbihState.active] || 0;
    const progress = Math.min(1, count / phrase.target);

    tasbihPhrase.textContent = phrase.text;
    tasbihCount.textContent = toAr(count);
    tasbihTarget.textContent = toAr(phrase.target);
    tasbihRounds.textContent = toAr(rounds);
    tasbihBtn.setAttribute(
      'aria-label',
      `اضغط للتسبيح — ${phrase.text} — ${count} من ${phrase.target}`
    );
    if (tasbihRing) {
      tasbihRing.style.strokeDashoffset = String(100 - progress * 100);
    }
    tasbihChips.forEach((chip) => {
      const isActive = chip.dataset.phrase === tasbihState.active;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function pulseTasbih() {
    if (!tasbihBtn || prefersReduced) return;
    tasbihBtn.classList.remove('is-beat');
    void tasbihBtn.offsetWidth;
    tasbihBtn.classList.add('is-beat');
  }

  if (tasbihBtn) {
    tasbihBtn.addEventListener('animationend', () => tasbihBtn.classList.remove('is-beat'));

    tasbihBtn.addEventListener('click', () => {
      if (tasbihCompleting) return;
      const phrase = PHRASES[tasbihState.active];
      let count = (tasbihState.counts[tasbihState.active] || 0) + 1;

      if (count >= phrase.target) {
        count = phrase.target;
        tasbihState.counts[tasbihState.active] = count;
        renderTasbih();
        tasbihCompleting = true;
        pulseTasbih();
        vibrate([14, 40, 22]);
        showToast('تمّت الدورة — تقبّل الله');
        window.setTimeout(() => {
          tasbihState.counts[tasbihState.active] = 0;
          tasbihState.rounds[tasbihState.active] =
            (tasbihState.rounds[tasbihState.active] || 0) + 1;
          tasbihCompleting = false;
          saveTasbih();
          renderTasbih();
        }, 750);
        saveTasbih();
        return;
      }

      tasbihState.counts[tasbihState.active] = count;
      saveTasbih();
      renderTasbih();
      pulseTasbih();
      vibrate(8);
    });
  }

  tasbihChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (tasbihCompleting) return;
      const phraseId = chip.dataset.phrase;
      if (!PHRASES[phraseId]) return;
      tasbihState.active = phraseId;
      saveTasbih();
      renderTasbih();
    });
  });

  if (tasbihReset) {
    tasbihReset.addEventListener('click', () => {
      if (tasbihCompleting) return;
      tasbihState.counts[tasbihState.active] = 0;
      tasbihState.rounds[tasbihState.active] = 0;
      saveTasbih();
      renderTasbih();
      showToast('تم تصفير العدّاد');
    });
  }

  renderTasbih();

  /* ---------- Quran reader ---------- */
  const surahs = Array.isArray(window.QURAN_SURAHS) ? window.QURAN_SURAHS : [];
  const reader = $('#readerDialog');
  const audio = $('#quranAudio');
  const ayahList = $('#ayahList');
  const readerTitle = $('#readerTitle');
  const readerBadge = $('#readerBadge');
  const readerBismillah = $('#readerBismillah');
  const readerBody = $('#readerBody');
  const audioStatus = $('#audioStatus');
  const audioCounter = $('#audioCounter');
  const audioProgressBar = $('#audioProgressBar');
  const audioProgress = $('.audio-progress');
  const playButton = $('#playAyah');
  const prevButton = $('#prevAyah');
  const nextButton = $('#nextAyah');
  const readerDone = $('#readerDone');
  const readerEndText = $('.reader-end p');
  const FONT_KEY = 'sadaqah-reader-font-v1';

  let currentSurah = null;
  let currentIndex = 0;
  let audioStarted = false;
  let fontScale = Number(readStorage(FONT_KEY, 1));
  if (!Number.isFinite(fontScale)) fontScale = 1;
  fontScale = Math.min(1.5, Math.max(0.8, Math.round(fontScale * 10) / 10));
  let lastTrigger = null;

  function applyFontScale() {
    if (!reader) return;
    reader.style.setProperty('--ayah-scale', String(fontScale));
    const minus = $('#fontMinus');
    const plus = $('#fontPlus');
    if (minus) minus.disabled = fontScale <= 0.8;
    if (plus) plus.disabled = fontScale >= 1.5;
  }

  function setProgress(percent) {
    const value = Math.max(0, Math.min(100, percent));
    if (audioProgressBar) audioProgressBar.style.width = `${value}%`;
    if (audioProgress) audioProgress.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  function setPlayingUI(isPlaying) {
    if (!reader) return;
    reader.classList.toggle('is-playing', isPlaying);
    if (playButton) {
      playButton.setAttribute('aria-label', isPlaying ? 'إيقاف التلاوة مؤقتًا' : 'تشغيل التلاوة');
    }
  }

  function setActiveAyah(index) {
    if (!currentSurah) return;
    $$('.ayah', ayahList).forEach((row, rowIndex) => {
      row.classList.toggle('is-active', rowIndex === index);
    });
    if (audioCounter) {
      audioCounter.textContent = `الآية ${toAr(index + 1)} من ${toAr(currentSurah.ayahs.length)}`;
    }
  }

  function updateTransport() {
    if (!currentSurah) return;
    if (prevButton) prevButton.disabled = currentIndex <= 0;
    if (nextButton) nextButton.disabled = currentIndex >= currentSurah.ayahs.length - 1;
  }

  function scrollToActive() {
    if (!readerBody) return;
    const active = $('.ayah.is-active', ayahList);
    if (!active) return;
    const bodyRect = readerBody.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const above = rect.top < bodyRect.top + 12;
    const below = rect.bottom > bodyRect.bottom - 12;
    if (above || below) {
      active.scrollIntoView({
        block: 'center',
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    }
  }

  function audioUrl(surah, index) {
    const surahPart = String(surah.surahNumber).padStart(3, '0');
    const ayahPart = String(surah.ayahs[index].n).padStart(3, '0');
    return `${AUDIO_BASE}${surahPart}${ayahPart}.mp3`;
  }

  function renderSurah(surah) {
    ayahList.innerHTML = '';
    surah.ayahs.forEach((ayah, index) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'ayah';
      row.dataset.index = String(index);

      const iconWrap = document.createElement('span');
      iconWrap.className = 'ayah-play';
      iconWrap.setAttribute('aria-hidden', 'true');
      iconWrap.innerHTML = '<svg class="icon"><use href="#i-play"></use></svg>';

      const text = document.createElement('span');
      text.className = 'ayah-text';
      text.appendChild(document.createTextNode(`${ayah.text} `));

      const number = document.createElement('span');
      number.className = 'ayah-num';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = `﴿${toAr(ayah.n)}﴾`;
      text.appendChild(number);

      row.appendChild(iconWrap);
      row.appendChild(text);
      row.addEventListener('click', () => {
        playIndex(index);
      });
      ayahList.appendChild(row);
    });
  }

  function playIndex(index) {
    if (!currentSurah || !audio) return;
    const lastIndex = currentSurah.ayahs.length - 1;
    currentIndex = Math.max(0, Math.min(index, lastIndex));
    audioStarted = true;
    setActiveAyah(currentIndex);
    updateTransport();
    setProgress(0);

    audio.src = audioUrl(currentSurah, currentIndex);
    if (audioStatus) audioStatus.textContent = 'جارٍ تحميل التلاوة…';
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        setPlayingUI(false);
        if (audioStatus) audioStatus.textContent = 'تعذّر تشغيل الصوت — تأكد من الاتصال';
        showToast('تعذّر تشغيل الصوت — تأكد من اتصالك بالإنترنت');
      });
    }
    scrollToActive();
  }

  function openReader(surahId, trigger) {
    if (!reader || typeof reader.showModal !== 'function') return;
    const surah = surahs.find((item) => item.id === surahId);
    if (!surah) return;

    lastTrigger = trigger || null;
    currentSurah = surah;
    currentIndex = 0;
    audioStarted = false;

    if (audio) {
      audio.pause();
    }
    setPlayingUI(false);
    setProgress(0);

    readerTitle.textContent = surah.name;
    readerBadge.textContent = surah.badge;
    readerBismillah.hidden = !surah.bismillah;
    renderSurah(surah);
    setActiveAyah(0);
    updateTransport();

    if (audioStatus) audioStatus.textContent = 'اضغط للاستماع';
    if (audioCounter) {
      audioCounter.textContent = `الآية ${toAr(1)} من ${toAr(surah.ayahs.length)}`;
    }
    if (readerDone) {
      readerDone.disabled = false;
      readerDone.classList.remove('is-done');
      readerDone.textContent = 'أتممتُ القراءة';
    }
    if (readerEndText) {
      readerEndText.textContent = 'اللهم اجعل ثواب ما قرأناه في ميزان حسناتها.';
    }

    readerBody.scrollTop = 0;
    applyFontScale();
    document.body.classList.add('is-locked');
    reader.showModal();
    window.requestAnimationFrame(() => {
      const closeBtn = $('#readerClose');
      if (closeBtn) closeBtn.focus();
    });
  }

  if (reader) {
    $$('[data-surah-id]').forEach((button) => {
      button.addEventListener('click', () => {
        openReader(button.dataset.surahId, button);
      });
    });

    const closeBtn = $('#readerClose');
    if (closeBtn) closeBtn.addEventListener('click', () => reader.close());

    reader.addEventListener('click', (event) => {
      if (event.target === reader) reader.close();
    });

    reader.addEventListener('close', () => {
      if (audio) audio.pause();
      setPlayingUI(false);
      document.body.classList.remove('is-locked');
      currentSurah = null;
      audioStarted = false;
      if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    });

    if (audio) {
      audio.addEventListener('play', () => {
        setPlayingUI(true);
        if (audioStatus && currentSurah) {
          audioStatus.textContent = `يتلى الآن — الآية ${toAr(currentIndex + 1)}`;
        }
      });

      audio.addEventListener('pause', () => {
        setPlayingUI(false);
        if (audioStatus && audioStarted && !audio.ended) {
          audioStatus.textContent = 'متوقف مؤقتًا';
        }
      });

      audio.addEventListener('timeupdate', () => {
        if (!audio.duration || !Number.isFinite(audio.duration)) return;
        setProgress((audio.currentTime / audio.duration) * 100);
      });

      audio.addEventListener('ended', () => {
        if (!reader.open || !currentSurah) return;
        if (currentIndex < currentSurah.ayahs.length - 1) {
          playIndex(currentIndex + 1);
        } else {
          setPlayingUI(false);
          setProgress(100);
          if (audioStatus) audioStatus.textContent = 'تمّت التلاوة — تقبّل الله';
          if (readerEndText) {
            readerEndText.textContent = 'تمّت التلاوة بحمد الله، جعلها الله في ميزان حسناتها.';
          }
        }
      });

      audio.addEventListener('error', () => {
        if (!audioStarted) return;
        setPlayingUI(false);
        if (audioStatus) audioStatus.textContent = 'تعذّرت التلاوة — تأكد من الاتصال';
      });
    }

    if (playButton) {
      playButton.addEventListener('click', () => {
        if (!currentSurah || !audio) return;
        if (reader.classList.contains('is-playing')) {
          audio.pause();
          return;
        }
        if (!audioStarted || audio.ended) {
          playIndex(audio.ended ? 0 : currentIndex);
          return;
        }
        const attempt = audio.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => {
            if (audioStatus) audioStatus.textContent = 'تعذّر تشغيل الصوت — تأكد من الاتصال';
          });
        }
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (!audio) return;
        if (audioStarted && audio.currentTime > 3) {
          audio.currentTime = 0;
          return;
        }
        if (currentIndex > 0) playIndex(currentIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (!currentSurah) return;
        if (currentIndex < currentSurah.ayahs.length - 1) {
          playIndex(currentIndex + 1);
        }
      });
    }

    if (readerDone) {
      readerDone.addEventListener('click', () => {
        if (readerDone.classList.contains('is-done')) return;
        readerDone.classList.add('is-done');
        readerDone.disabled = true;
        readerDone.textContent = 'تقبّل الله';
        if (readerEndText) {
          readerEndText.textContent = 'تقبّل الله دعاءك، وجعل القرآن نورًا لها في قبرها.';
        }
      });
    }

    const fontMinus = $('#fontMinus');
    const fontPlus = $('#fontPlus');

    if (fontMinus) {
      fontMinus.addEventListener('click', () => {
        fontScale = Math.max(0.8, Math.round((fontScale - 0.1) * 10) / 10);
        writeStorage(FONT_KEY, fontScale);
        applyFontScale();
      });
    }

    if (fontPlus) {
      fontPlus.addEventListener('click', () => {
        fontScale = Math.min(1.5, Math.round((fontScale + 0.1) * 10) / 10);
        writeStorage(FONT_KEY, fontScale);
        applyFontScale();
      });
    }

    applyFontScale();
  }
})();
