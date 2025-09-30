// Будущие интерактивные элементы
// Пример: установка текущего года в подвале
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Карусель отзывов: автопрокрутка, пауза при наведении, ручное управление
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  if (viewport && track) {
    const slides = Array.from(track.children);
    const slideCount = slides.length;
    let index = 0;
    let timerId = null;

    const goTo = (i) => {
      index = (i + slideCount) % slideCount;
      const offset = viewport.clientWidth * index;
      track.scrollTo({ left: offset, behavior: 'smooth' });
      updateButtons();
    };

    const updateButtons = () => {
      // Кнопки всегда активны; можно отключать у краёв если без циклической прокрутки
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const startAuto = () => {
      if (timerId) return;
      timerId = setInterval(() => {
        next();
      }, 4000);
    };
    const stopAuto = () => {
      clearInterval(timerId);
      timerId = null;
    };

    // Автостарт
    startAuto();

    // Пауза при наведении
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);

    // Обновление активного индекса по ручному скроллу
    let scrollTimeout = null;
    track.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const w = viewport.clientWidth;
        index = Math.round(track.scrollLeft / w);
        updateButtons();
      }, 100);
    });

    // Кнопки
    prevBtn && prevBtn.addEventListener('click', () => { stopAuto(); prev(); });
    nextBtn && nextBtn.addEventListener('click', () => { stopAuto(); next(); });

    // Клавиатура
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { stopAuto(); next(); }
      if (e.key === 'ArrowLeft') { stopAuto(); prev(); }
    });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { stopAuto(); next(); }
      if (e.key === 'ArrowLeft') { stopAuto(); prev(); }
    });
  }

  // Отправка отзыва: добавление в карусель и localStorage
  const testimonialForm = document.querySelector('.testimonial-form');
  const TESTIMONIALS_KEY = 'portfolio-testimonials';
  const loadTestimonials = () => {
    try { return JSON.parse(localStorage.getItem(TESTIMONIALS_KEY) || '[]'); } catch { return []; }
  };
  const saveTestimonials = (arr) => {
    localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(arr));
  };
  const renderTestimonial = ({ name, role, text, avatar }) => {
    li.className = 'testimonial card';
    li.setAttribute('aria-roledescription', 'slide');
    li.innerHTML = `
      <div class="testimonial-header">
        <img class="testimonial-avatar" src="${avatar || 'https://via.placeholder.com/64x64.png?text=U'}" alt="${name} — аватар" width="64" height="64">
        <div>
          <div class="testimonial-name">${name}</div>
          <div class="testimonial-role">${role || ''}</div>
        </div>
      </div>
      <p></p>
    `;
    li.querySelector('p').textContent = text;
    return li;
  };

  // Инициализация ранее сохранённых
  (function initStoredTestimonials(){
    const list = loadTestimonials();
    if (list.length && track) {
      const frag = document.createDocumentFragment();
      list.forEach((t) => frag.appendChild(renderTestimonial(t)));
      track.appendChild(frag);
    }
  })();

  testimonialForm && testimonialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = testimonialForm.querySelector('.form-note');
    const setNote = (msg, isError=false) => {
      if (!note) return;
      note.textContent = msg;
      note.classList.toggle('error', !!isError);
      note.classList.add('show');
      setTimeout(() => note.classList.remove('show'), 3000);
    };

    // HTML5-валидация
    if (!testimonialForm.checkValidity()) {
      testimonialForm.reportValidity();
      setNote('Проверьте корректность полей.', true);
      return;
    }

    const nameInput = document.getElementById('t-name');
    const roleInput = document.getElementById('t-role');
    const avatarInput = document.getElementById('t-avatar');
    const textInput = document.getElementById('t-text');

    const name = (nameInput.value || '').trim();
    const role = (roleInput.value || '').trim();
    const avatarRaw = (avatarInput.value || '').trim();
    const text = (textInput.value || '').trim();

    // Доп. проверки
    if (name.length < 2) { setNote('Имя слишком короткое.', true); nameInput.focus(); return; }
    if (text.length < 5) { setNote('Текст отзыва слишком короткий.', true); textInput.focus(); return; }

    let avatar = '';
    if (avatarRaw) {
      try {
        const u = new URL(avatarRaw);
        avatar = u.href;
      } catch {
        setNote('Ссылка на аватар некорректна.', true); avatarInput.focus(); return;
      }
    }

    const item = { name, role, avatar, text };
    const list = loadTestimonials();
    list.push(item);
    saveTestimonials(list);

    if (track) {
      const node = renderTestimonial(item);
      track.appendChild(node);
    }

    setNote('Спасибо! Отзыв добавлен.');
    testimonialForm.reset();
  });

  // Переключатель темы с сохранением
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const THEME_KEY = 'portfolio-theme';
  const applyTheme = (mode) => {
    if (mode === 'dark') {
      root.classList.add('theme-dark');
      themeToggle && themeToggle.setAttribute('aria-pressed', 'true');
      themeToggle && (themeToggle.textContent = '☀️');
    } else {
      root.classList.remove('theme-dark');
      themeToggle && themeToggle.setAttribute('aria-pressed', 'false');
      themeToggle && (themeToggle.textContent = '🌙');
    }
  };
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'dark' ? 'dark' : 'light');
  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = root.classList.toggle('theme-dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });

  // Бургер-меню
  const burger = document.querySelector('.burger-toggle');
  const menu = document.getElementById('site-menu');
  const closeMenu = () => {
    if (!menu) return;
    menu.classList.remove('open');
    burger && burger.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    if (!menu) return;
    menu.classList.add('open');
    burger && burger.setAttribute('aria-expanded', 'true');
  };
  burger && burger.addEventListener('click', () => {
    if (menu && menu.classList.contains('open')) closeMenu(); else openMenu();
  });
  // Закрытие меню по клику на ссылку
  menu && menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  // Закрытие по клику вне
  document.addEventListener('click', (e) => {
    if (!menu || !burger) return;
    if (menu.contains(e.target) || burger.contains(e.target)) return;
    closeMenu();
  });
  // Закрытие по ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // Сообщение об отправке формы
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      let note = contactForm.querySelector('.form-note');
      if (!note) {
        note = document.createElement('div');
        note.className = 'form-note';
        note.setAttribute('role', 'status');
        btn && btn.insertAdjacentElement('afterend', note);
      }
      note.textContent = 'Спасибо!\nВаше сообщение отправлено.';
      note.classList.add('show');
      setTimeout(() => note.classList.remove('show'), 3000);
      contactForm.reset();
    });
  }

  // Анимация прогресс-баров навыков и появление
  const skillProgressBars = document.querySelectorAll('.skill-bar .skill-progress');
  const revealables = document.querySelectorAll('.section, .card, .skill-card, .interest-card, .testimonial');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Прогресс-бары внутри секции
        entry.target.querySelectorAll && entry.target.querySelectorAll('.skill-bar[aria-valuenow]').forEach((bar) => {
          const now = parseInt(bar.getAttribute('aria-valuenow'), 10);
          const prog = bar.querySelector('.skill-progress');
          if (prog && !prog.dataset.animated) {
            prog.style.width = Math.max(0, Math.min(100, now)) + '%';
            prog.dataset.animated = '1';
          }
        });
      }
    });
  }, { threshold: 0.2 });
  revealables.forEach((el) => { el.classList.add('reveal-on-scroll'); revealObserver.observe(el); });

  // Кнопка «вверх»
  const backToTop = document.querySelector('.back-to-top');
  const onScrollTopBtn = () => {
    if (!backToTop) return;
    if (window.scrollY > 560) backToTop.classList.add('show'); else backToTop.classList.remove('show');
  };
  window.addEventListener('scroll', onScrollTopBtn, { passive: true });
  backToTop && backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Фолбэк для изображений
  const applyImgFallback = (img) => {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.src = 'https://via.placeholder.com/64x64.png?text=U';
  };
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => applyImgFallback(img), { once: true });
  });
  // Плавный скролл по навигации
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Подсветка активной секции в меню
  const sections = document.querySelectorAll('section[id]');
  const linkById = new Map(
    Array.from(navLinks).map((a) => [a.getAttribute('href'), a])
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = '#' + entry.target.id;
      const link = linkById.get(id);
      if (!link) return;
      if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
        document.querySelectorAll('.site-nav a.active').forEach((el) => el.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: [0.2, 0.55, 0.8] });
  sections.forEach((s) => observer.observe(s));

  // Интерактивный фон: летающие иконки
  const sectionIcons = {
    about: ['👨\u200d💻','💡','✨','🧩'],
    projects: ['💻','🧠','🧩','🚀'],
    contacts: ['✉️','📞','📬','💬'],
    skills: ['⚙️','📐','🔧','🧪'],
    testimonials: ['⭐','👏','💬','👍'],
    interests: ['🏋️','📚','🎓','🎧']
  };

  const createFloatingIcons = (section, icons) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'floating-icons';
    const count = Math.min(8, Math.max(4, Math.floor(section.clientWidth / 220)));
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'floating-icon';
      span.textContent = icons[i % icons.length];
      span.style.left = Math.random() * 100 + '%';
      span.style.top = Math.random() * 100 + '%';
      const dur = 10 + Math.random() * 12;
      const delay = -Math.random() * dur;
      span.style.animationDuration = dur + 's';
      span.style.animationDelay = delay + 's';
      span.style.fontSize = (14 + Math.random() * 16) + 'px';
      wrapper.appendChild(span);
    }
    section.prepend(wrapper);
  };

  document.querySelectorAll('.section').forEach((sec) => {
    const id = sec.id;
    if (id && sectionIcons[id]) {
      createFloatingIcons(sec, sectionIcons[id]);
    }
  });
});

