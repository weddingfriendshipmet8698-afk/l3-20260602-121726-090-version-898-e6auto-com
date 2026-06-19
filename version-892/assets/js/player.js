(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("playButton");
        if (!video || !button || !streamUrl) {
            return;
        }

        var attached = false;
        var attachSource = function () {
            if (!attached) {
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
            button.classList.add("is-hidden");
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        };

        button.addEventListener("click", attachSource);
        video.addEventListener("click", function () {
            if (video.paused) {
                attachSource();
            }
        });
    };
})();
