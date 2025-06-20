document.addEventListener('DOMContentLoaded', () => {
  // Custom cursor
  if (!document.querySelector('.cursor-main')) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-main';
    document.body.appendChild(cursor);

    // Inject dynamic styles
    const style = document.createElement('style');
    style.textContent = `
      .cursor-main {
        --size: 40px;
        position: fixed;
        top: 0;
        left: 0;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        background-color: #886BF2;
        box-shadow: 0 0 30px #af83ff;
        mix-blend-mode: difference;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.3s ease, top 0.08s ease, left 0.08s ease;
      }
      @media (max-width: 1280px) {
        .cursor-main { display: none; }
      }
    `;
    document.head.appendChild(style);

    // Cursor follows mouse
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateCursor() {
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Breathing effect
    let breathing = true;
    let hoveringLink = false;
    let t = 0;
    function breathLoop() {
      if (breathing) {
        const scale = 1 + 0.5 * Math.sin(t);
        cursor.style.transform = `translate(-50%, -50%) scale(${scale})`;
        t += 0.05;
      }
      requestAnimationFrame(breathLoop);
    }
    breathLoop();

    // Link hover disables breathing, scales to 0
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        hoveringLink = true;
        breathing = false;
        cursor.style.transform = `translate(-50%, -50%) scale(0)`;
      });
      link.addEventListener('mouseleave', () => {
        // Use setTimeout to allow for quick movement between links
        setTimeout(() => {
          // Check if the mouse is still over any <a>
          if (!document.querySelector(':hover').closest('a')) {
            hoveringLink = false;
            cursor.style.transform = `translate(-50%, -50%) scale(1)`;
            setTimeout(() => breathing = true, 300);
          }
        }, 10);
      });
    });

    // Optional: If you want to be extra robust, listen for mousemove on document
    document.addEventListener('mousemove', (e) => {
      if (!e.target.closest('a') && hoveringLink) {
        hoveringLink = false;
        cursor.style.transform = `translate(-50%, -50%) scale(1)`;
        setTimeout(() => breathing = true, 300);
      }
    });

  }

  // URL scroll to section
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  if (section) {
    const targetElement = document.getElementById(section);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Video player controls
  const video = document.getElementById('video_player');
  if (video) {
    video.controls = false;
    video.addEventListener('click', () => {
      video.controls = !video.controls;
    });
    video.addEventListener('pause', () => {
      video.controls = false;
    });
  }

  // Animate .exp-title from right — once
  const title = document.querySelector('.exp-title');
  if (title) {
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          title.classList.add('in-view');
          titleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 }); // Lower threshold for better mobile support
    titleObserver.observe(title);
  }

  // Animate .experience-item from bottom with stagger — once
  const items = document.querySelectorAll('.experience-item');
  if (items.length) {
    const itemsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, index * 200);
          itemsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(item => itemsObserver.observe(item));
  }

  // Animate .whatiknow-left from left
  const whatiknowLeft = document.querySelector('.whatiknow-left');
  if (whatiknowLeft) {
    const leftObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          whatiknowLeft.classList.add('in-view');
          leftObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    leftObserver.observe(whatiknowLeft);
  }

  // Animate .skills-container from right — once
  const skillsContainer = document.querySelector('.skills-container');
  if (skillsContainer) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillsContainer.classList.add('in-view');
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    skillsObserver.observe(skillsContainer);
  }

  // Animate .whatiknow-right-items > .border from right, staggered
  const rightItems = document.querySelectorAll('.whatiknow-right-items .border');
  if (rightItems.length) {
    const rightObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger effect
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, Number(entry.target.dataset.index || 0) * 200);
          rightObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    rightItems.forEach((el, i) => {
      el.dataset.index = i;
      rightObserver.observe(el);
    });
  }

  // Animate .intro section children from bottom — once
  const introElements = document.querySelectorAll('.intro, .intro .title, .intro .about');
  if (introElements.length) {
    const introObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, index * 200);
          introObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    introElements.forEach(el => introObserver.observe(el));
  }

  // Horizontal Scroll for Skills Section
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const skillsContainer = document.querySelector(".skills-container");
    if (skillsContainer) {
      const totalScroll = skillsContainer.scrollWidth - window.innerWidth;
      gsap.to(skillsContainer, {
        x: () => `-${totalScroll}px`,
        ease: "none",
        scrollTrigger: {
          trigger: ".skills-section",
          start: "top 15%",
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        }
      });
    }
  }
});
