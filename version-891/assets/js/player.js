function setupMoviePlayer(videoElement, playButton, sourceUrl) {
  if (!videoElement || !playButton || !sourceUrl) {
    return;
  }

  let sourceAttached = false;

  function attachSource() {
    if (sourceAttached) {
      return;
    }

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = sourceUrl;
      sourceAttached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(videoElement);
      sourceAttached = true;
      return;
    }

    videoElement.src = sourceUrl;
    sourceAttached = true;
  }

  function startPlayback() {
    attachSource();
    playButton.classList.add('is-hidden');

    const playPromise = videoElement.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playButton.classList.remove('is-hidden');
      });
    }
  }

  playButton.addEventListener('click', startPlayback);

  videoElement.addEventListener('click', function () {
    if (videoElement.paused) {
      startPlayback();
    }
  });

  videoElement.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });

  videoElement.addEventListener('pause', function () {
    if (!videoElement.ended) {
      playButton.classList.remove('is-hidden');
    }
  });
}
