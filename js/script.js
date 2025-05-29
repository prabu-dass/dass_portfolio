document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.cursor-circle')) {
    const circleDiv = document.createElement('div');
    circleDiv.className = 'cursor-circle';

    const dotDiv = document.createElement('div');
    dotDiv.className = 'cursor-dot';

    circleDiv.appendChild(dotDiv);
    document.body.appendChild(circleDiv);
  }

  // ----- URL scroll to section -----
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');
  if (section) {
    const targetElement = document.getElementById(section);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ----- Video player -----
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

   // Create the cursor
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
      .cursor-main {
        display: none;
      }
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

  // Smooth sinusoidal breathing (continuous)
  let breathing = true;
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
      breathing = false;
      cursor.style.transform = `translate(-50%, -50%) scale(0)`;
    });
    link.addEventListener('mouseleave', () => {
      cursor.style.transform = `translate(-50%, -50%) scale(1)`;
      setTimeout(() => breathing = true, 300); // resume breathing smoothly
    });
  });


  // ----- Smart Back Button Behavior -----

  const backBtn = document.querySelector('.projects-wrap .backward');

  window.addEventListener('scroll', () => {
    const triggerHeight = window.innerHeight * 0.4;

    if (window.scrollY > triggerHeight) {
      backBtn.classList.add('fixed');
    } else {
      backBtn.classList.remove('fixed');
    }
  });

  // ----- Experience section -----
/*
    const innerLine = document.querySelector('.inner-experience .inner');
    const experienceSection = document.querySelector('.experience-section');
    const experienceItems = document.querySelectorAll('.experience-item');

    // Dynamically set height of experience section based on items
    const itemHeight = experienceItems[0].offsetHeight;
    const spacing = 50; // vertical spacing between items
    const totalHeight = window.innerHeight / 2 + experienceItems.length * (itemHeight + spacing);
    experienceSection.style.height = `${totalHeight}px`;

    // Handle scroll effect
    window.addEventListener('scroll', () => {
      const sectionTop = experienceSection.offsetTop;
      const sectionHeight = experienceSection.offsetHeight;
      const scrollY = window.scrollY + window.innerHeight;
      const progress = Math.min(Math.max((scrollY - sectionTop) / sectionHeight, 0), 1);

      // Line grows/shrinks
      innerLine.style.height = `${progress * 100}%`;

      // Reveal items
      experienceItems.forEach((item, index) => {
        const triggerPoint = sectionTop + sectionHeight * ((index + 1) / (experienceItems.length + 1));
        if (window.scrollY + window.innerHeight * 0.9 >= triggerPoint) {
          item.classList.add('visible');
        } else {
          item.classList.remove('visible');
        }
    });
  });*/

// Animate .exp-title from right — once
const title = document.querySelector('.exp-title');

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      title.classList.add('in-view');
      titleObserver.unobserve(entry.target); // stop observing after animation
    }
  });
}, {
  threshold: 0.6
});

titleObserver.observe(title);


// Animate .experience-item from bottom with stagger — once
const items = document.querySelectorAll('.experience-item');

const itemsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = entry.target.dataset.index || 0;
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, index * 200);
      itemsObserver.unobserve(entry.target); // stop observing
    }
  });
}, {
  threshold: 0.2
});

items.forEach(item => itemsObserver.observe(item));


// Animate .intro section children from bottom — once
const introElements = document.querySelectorAll('.intro, .intro .title, .intro .about');

const introObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = entry.target.dataset.index || 0;
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, index * 200);
      introObserver.unobserve(entry.target); // stop observing
    }
  });
}, {
  threshold: 0.2
});

introElements.forEach(el => introObserver.observe(el));

// Horizontal Scroll for Skills Section
gsap.registerPlugin(ScrollTrigger);

const skillsContainer = document.querySelector(".skills-container");

// Calculate total scroll distance for horizontal scroll
const totalScroll = skillsContainer.scrollWidth - window.innerWidth;

// Apply horizontal scroll animation with pin
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

});
