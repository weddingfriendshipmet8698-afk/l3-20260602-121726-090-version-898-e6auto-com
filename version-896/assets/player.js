(function () {
  var video = document.getElementById('movieVideo');
  var button = document.getElementById('playButton');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hls = null;
  var ready = false;

  function bindSource() {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = source;
    ready = true;
  }

  function playVideo() {
    bindSource();
    if (button) {
      button.classList.add('is-hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
