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
      transition: top 0.3s ease-out, left 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out;
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
});
