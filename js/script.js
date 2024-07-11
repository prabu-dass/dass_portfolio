document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section) {
        const targetElement = document.getElementById(section);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});


//Video player

var video = document.getElementById('video_player');

video.controls = false;

video.addEventListener('click', () => {
    video.controls = !video.controls;
    //video.play();
})

video.addEventListener('pause'), () => {
    video.controls = false;
}