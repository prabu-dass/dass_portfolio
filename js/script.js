// Inject the cursor-circle div if not already present
if (!document.querySelector('.cursor-circle')) {
  const circleDiv = document.createElement('div');
  circleDiv.className = 'cursor-circle';
  document.body.appendChild(circleDiv);
}


document.addEventListener('DOMContentLoaded', () => {
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

  // Mouse Circle
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
});
