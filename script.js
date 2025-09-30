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
      viewport.scrollTo({ left: offset, behavior: 'smooth' });
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
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', startAuto);

    // Обновление активного индекса по ручному скроллу
    let scrollTimeout = null;
    viewport.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const w = viewport.clientWidth;
        index = Math.round(viewport.scrollLeft / w);
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
    const li = document.createElement('li');
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
    const name = document.getElementById('t-name').value.trim() || 'Аноним';
    const role = document.getElementById('t-role').value.trim() || '';
    const avatar = document.getElementById('t-avatar').value.trim();
    const text = document.getElementById('t-text').value.trim();
    if (!text) return;
    const item = { name, role, avatar, text };
    const list = loadTestimonials();
    list.push(item);
    saveTestimonials(list);
    if (track) {
      const node = renderTestimonial(item);
      track.appendChild(node);
    }
    const note = testimonialForm.querySelector('.form-note');
    if (note) { note.textContent = 'Спасибо! Отзыв добавлен.'; note.classList.add('show'); setTimeout(()=>note.classList.remove('show'), 3000); }
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

