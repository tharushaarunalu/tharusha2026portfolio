document.addEventListener('DOMContentLoaded', () => {
  console.log('Potporli App Initialized');

  // Theme Logic
  const themeToggleBlocks = document.querySelectorAll('.theme-toggle');
  const html = document.documentElement;

  const getTheme = () => {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  };

  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icons for all toggles
    themeToggleBlocks.forEach(btn => {
      const sunIcon = btn.querySelector('.sun-icon');
      const moonIcon = btn.querySelector('.moon-icon');
      if (theme === 'light') {
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
      } else {
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
      }
    });
  };

  // Initial theme setup
  setTheme(getTheme());

  themeToggleBlocks.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const closeOnClickLinks = document.querySelectorAll('.close-on-click');

  const toggleSidebar = () => {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
    document.body.classList.toggle('overflow-hidden');
  };

  mobileMenuBtn?.addEventListener('click', toggleSidebar);
  closeMenuBtn?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  closeOnClickLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!sidebar.classList.contains('-translate-x-full')) {
        toggleSidebar();
      }
    });
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }

      // Close sidebar if mobile
      if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      }
    });
  });

  // Modal Logic
  const openModalBtns = document.querySelectorAll('[data-modal-target]');
  const closeModalBtns = document.querySelectorAll('[data-modal-close]');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-container');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // Simple scroll animation trigger
  const observerOptions = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // Load about content from secure backend API
  async function loadAbout() {
    try {
      const res = await fetch('/api/about');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const el = document.getElementById('about-dynamic');
      if (el && data.page) {
        el.innerHTML = `<h2 class="text-3xl font-bold mb-4">${data.page.title}</h2><div class="text-white/70 leading-relaxed">${data.page.content}</div>`;
        el.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('Could not load about content:', err);
    }
  }

  loadAbout();
});
