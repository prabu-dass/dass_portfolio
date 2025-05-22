document.addEventListener('DOMContentLoaded', () => {
  // Inject cursor elements if not present
  if (!document.querySelector('.cursor-circle')) {
    const circleDiv = document.createElement('div');
    circleDiv.className = 'cursor-circle';

    const dotDiv = document.createElement('div');
    dotDiv.className = 'cursor-dot';

    circleDiv.appendChild(dotDiv);
    document.body.appendChild(circleDiv);
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

  // Video player
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

  // Mouse Circle with Dot
  const circle = document.querySelector('.cursor-circle');
  if (circle) {
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      currentX += (mouseX - currentX) * 0.2;
      currentY += (mouseY - currentY) * 0.2;

      circle.style.left = `${currentX}px`;
      circle.style.top = `${currentY}px`;

      requestAnimationFrame(animate);
    }

    animate();
  }

  // Smart Back Button Behavior
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
