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

  // ----- Mouse Circle with Dot -----

  const cursor = document.createElement('div');
  cursor.className = 'cursor-main';
  document.body.appendChild(cursor);

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
      transform: translate(-50%, -50%);
      transition: top 0.1s ease-out, left 0.1s ease-out, width 0.1s ease-out, height 0.1s ease-out;
      animation: breathe 2s ease-in-out infinite;
    }

    @keyframes breathe {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.5);
      }
    }
  `;
  document.head.appendChild(style);

  // Animate cursor following the mouse
  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('mousemove', (e) => {
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

    const innerLine = document.querySelector('.inner-experience .inner');
  const experienceSection = document.querySelector('.experience-section');
  const experienceItems = document.querySelectorAll('.experience-item');

  // Dynamically set height of experience section based on items
  const itemHeight = experienceItems[0].offsetHeight;
  const spacing = 100; // vertical spacing between items
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
  });
});
