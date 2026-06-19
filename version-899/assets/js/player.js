(function () {
    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-video-start]');
        const loading = player.querySelector('[data-video-loading]');
        const message = player.querySelector('[data-video-message]');
        const url = video ? video.getAttribute('data-video') : '';
        let prepared = false;
        let hls = null;

        function setLoading(show) {
            if (loading) {
                loading.hidden = !show;
            }
        }

        function setMessage(show) {
            if (message) {
                message.hidden = !show;
            }
        }

        function prepare() {
            if (!video || !url || prepared) {
                return Promise.resolve();
            }

            prepared = true;
            setLoading(true);
            setMessage(false);

            return new Promise(function (resolve) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setLoading(false);
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            setLoading(false);
                            setMessage(true);
                            if (hls) {
                                hls.destroy();
                                hls = null;
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.addEventListener('loadedmetadata', function () {
                        setLoading(false);
                        resolve();
                    }, { once: true });
                    video.addEventListener('error', function () {
                        setLoading(false);
                        setMessage(true);
                    }, { once: true });
                } else {
                    setLoading(false);
                    setMessage(true);
                    resolve();
                }
            });
        }

        function play() {
            prepare().then(function () {
                if (!video || !video.paused) {
                    return;
                }
                const playTask = video.play();
                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {
                        setMessage(true);
                    });
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                video.setAttribute('controls', 'controls');
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
