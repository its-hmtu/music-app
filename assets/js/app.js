const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER';

const player = $('.player');
const cd = $('.cd');
const songName = $('header h2');
const songSinger = $('header p');
const cdThumbnail = $('.cd-thumb');
const audio = $('#audio');
const playControl = $('.btn-toggle-play');
const progress = $('#progress');
const volume = $('#volume');
const next = $('.btn-next');
const prev = $('.btn-prev');
const random = $('.btn-random');
const repeat = $('.btn-repeat');
const playlist = $('.playlist');
const background = $('.background');
const onGoingTime = $('.on-going');
const durationRemaining = $('.duration-remaining');
const bgVideo = $('#background-video');
const playingSongName = $('.playing-song-info h2');
const playingSongSinger = $('.playing-song-info p');
const playingSongThumbnail = $('.playing-song-thumb img');
const headerPlayingSong = $('.playing-song');
const volumeOff = $('.btn-volume-off');
const volumeUp = $('.btn-volume-up');
const volumeDown = $('.btn-volume-down');
const body = $('body');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    configs: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.configs[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.configs));
    },
    
    songs: [
        {
            name: 'The Chad',
            singer: 'Sớt',
            path: './assets/music/song/ben-80.mp3',
            thumbnail: './assets/music/img/ben-chad.jpg',
            video: './assets/music/vid/ben-80.mp4'
        },
        {
            name: 'Hold My Hand',
            singer: 'Lady Gaga',
            path: './assets/music/song/song1.mp3',
            thumbnail: './assets/music/img/img1.png',
            video: './assets/music/vid/lady-gaga-hold-my-hand - Trim.mp4'
        },
        {
            name: 'Castle On The Hill',
            singer: 'Ed Sheeran',
            path: './assets/music/song/song2-edsheeran.mp3',
            thumbnail: './assets/music/img/img2.jfif',
            video: './assets/music/vid/ed-sheeran-castle-on-the-hill - Trim.mp4'
        },
        {
            name: 'Smooth Criminal',
            singer: 'Michael Jackson',
            path: './assets/music/song/michael-jackson-smooth-criminal.mp3',
            thumbnail: './assets/music/img/smooth-criminal.jfif',
            video: './assets/music/vid/mj-smooth-criminal-short - Trim.mp4'
        },
        {
            name: 'Billie Jean',
            singer: 'Michael Jackson',
            path: './assets/music/song/mj-billie-jean.mp3',
            thumbnail: './assets/music/img/mj-billie-jean.jfif',
            video: './assets/music/vid/mj-billie-jean - Trim.mp4'
        },
        {
            name: 'Beat It',
            singer: 'Michael Jackson',
            path: './assets/music/song/mj-beat-it.mp3',
            thumbnail: './assets/music/img/mj-billie-jean.jfif',
            video: './assets/music/vid/mj-beat-it - Trim.mp4'
        },
        {
            name: 'Set The Rain On Fire',
            singer: 'Adele',
            path: './assets/music/song/adele-set-the-rain-on-fire.mp3',
            thumbnail: './assets/music/img/adele-21.jfif',
        },
    ],

    // create recently played is a Set to avoid duplicate song
    recentlyPlayed: [],

    render: function() {
        const songList = this.songs.map((song, index) => {
            const isActive = index === this.currentIndex ? 'active' : '';
            const songIndex = index + 1;
            return `
                <div class="song-item ${isActive}" data-index="${index}">
                    <span class="song-index">${songIndex}</span>
                    <div class="song-thumbnail"
                        style="background-image: url('${song.thumbnail}')">
                    </div>
                    <div class="song-infor">
                        <h3 class="song-name">${song.name}</h3>
                        <p class="song-singer">${song.singer}</p>
                    </div>
                    <div class="song-control">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = songList.join('');
    },
    
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        // rotate CD
        const cdThumbRotate = cdThumbnail.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000, // 10s
            iterations: Infinity
        });
        cdThumbRotate.pause();

        // // Zoom in/out CD
        // const headerWidth = headerPlayingSong.offsetHeight;

        // document.onscroll = function() {
        //     const scrollTop = window.scrollY || document.documentElement.scrollTop;
        //     const newHeaderWidth = headerWidth - scrollTop;

        //     headerPlayingSong.style.height = newHeaderWidth > 0 ? newHeaderWidth + 'px' : 0;
        //     playingSongThumbnail.style.opacity = newHeaderWidth / headerWidth;
        // };

        // Play/pause song
        playControl.onclick = function() {
            (app.isPlaying) ? audio.pause() : audio.play();
        };

        // When song is playing
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            setTimeout(() => {
                cdThumbRotate.play();
            }, 500);
            app.addToRecentlyPlayed();
        };

        // When song is paused
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            setTimeout(() => {
                cdThumbRotate.pause();
            }, 500);
        };

        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                progress.style.background = `linear-gradient(to right, #1DB954 ${progressPercent}%, #d3d3d3 ${progressPercent}%)`;
                // on going time
                let onGoingMinute = Math.floor(audio.currentTime / 60);
                let onGoingSecond = Math.floor(audio.currentTime % 60);
                if (onGoingSecond < 10) {
                    onGoingSecond = `0${onGoingSecond}`;
                }
                onGoingTime.innerHTML = `${onGoingMinute}:${onGoingSecond}`;

                // duration remaining auto update when song is playing in minus time 
                let durationRemainingMinute = Math.floor((audio.duration - audio.currentTime) / 60);
                let durationRemainingSecond = Math.floor((audio.duration - audio.currentTime) % 60);
                if (durationRemainingSecond < 10) {
                    durationRemainingSecond = `0${durationRemainingSecond}`;
                }
                durationRemaining.innerHTML = `-${durationRemainingMinute}:${durationRemainingSecond}`;
            }
        };

        // on audio ended
        audio.onended = function() {
            (app.isRepeat) ? audio.play() : next.click();
        };

        progress.oninput = function() {
            const seekTime = (progress.value * audio.duration) / 100;
            audio.currentTime = seekTime;
        };

        // Change volume
        volume.oninput = function() {
            audio.volume = volume.value;
            if (volume.value == 0) {
                volumeOff.classList.remove('hidden');
                volumeUp.classList.add('hidden');
                volumeDown.classList.add('hidden');
            } else if (volume.value > 0 && volume.value < 0.7) {
                volumeOff.classList.add('hidden');
                volumeUp.classList.add('hidden');
                volumeDown.classList.remove('hidden');
            } else {
                volumeOff.classList.add('hidden');
                volumeUp.classList.remove('hidden');
                volumeDown.classList.add('hidden');
            }
            const volumePercent = volume.value * 100;
            volume.style.background = `linear-gradient(to right, #1DB954 ${volumePercent}%, #d3d3d3 ${volumePercent}%)`;
        };


        // Turn on volume when click on volumn off
        volumeOff.onclick = function() {
            volume.value = 0.5;
            audio.volume = volume.value;
            volumeOff.classList.add('hidden');
            volumeUp.classList.add('hidden');
            volumeDown.classList.remove('hidden');
            const volumePercent = volume.value * 100;
            volume.style.background = `linear-gradient(to right, #1DB954 ${volumePercent}%, #d3d3d3 ${volumePercent}%)`;
        }

        // Turn off volume when click on volumn up
        volumeUp.onclick = function() {
            volume.value = 0;
            audio.volume = volume.value;
            volumeOff.classList.remove('hidden');
            volumeUp.classList.add('hidden');
            volumeDown.classList.add('hidden');
            const volumePercent = volume.value * 100;
            volume.style.background = `linear-gradient(to right, #1DB954 ${volumePercent}%, #d3d3d3 ${volumePercent}%)`;
        }


        // Next song
        next.onclick = function() {
            (app.isRandom) ? app.randomSong() : app.nextSong();
            audio.play();
        }

        // Prev song
        prev.onclick = function() {
            (app.isRandom) ? app.randomSong() : app.prevSong();
            audio.play();
        }

        // Random song
        random.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            random.classList.toggle('active', app.isRandom);
        }

        // Repeat song 
        repeat.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeat.classList.toggle('active', app.isRepeat);
        }

        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song-item:not(.active)');
            const optionNode = e.target.closest('.song-control');
            if (songNode || optionNode) {
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong();
                    app.updateActiveSong();
                    audio.play();
                }

                if (optionNode) {
                    console.log('option');
                }
            }
        }
    },

    loadCurrentSong: function() {
        songName.innerHTML = this.currentSong.name;
        songSinger.innerHTML = this.currentSong.singer;
        cdThumbnail.style.backgroundImage = `url('${this.currentSong.thumbnail}')`;
        audio.src = this.currentSong.path;
        
        // check if current song has video or not
        if (this.currentSong.video === undefined) {
            background.style.backgroundImage = `url('${this.currentSong.thumbnail}')`;
            background.classList.add('background-img');
            bgVideo.src = '';
            bgVideo.classList.add('hidden');
        } else {
            bgVideo.src = this.currentSong.video;
            bgVideo.classList.remove('hidden');
            background.classList.remove('background-img');
        }   

        let onGoingMinute = Math.floor(audio.currentTime / 60);
        let onGoingSecond = Math.floor(audio.currentTime % 60);
        if (onGoingSecond < 10) {
            onGoingSecond = `0${onGoingSecond}`;
        }
        onGoingTime.innerHTML = `${onGoingMinute}:${onGoingSecond}`;

        // duration
        audio.addEventListener('loadedmetadata', () => {
            let durationMinute = Math.floor(audio.duration / 60);
            let durationSecond = Math.floor(audio.duration % 60);
            if (durationSecond < 10) {
                durationSecond = `0${durationSecond}`;
            }

            durationRemaining.innerHTML = `${durationMinute}:${durationSecond}`;
        });
    },

    updateActiveSong: function() {
        $$('.song-item').forEach((song, index) => {
            if (index === this.currentIndex) {
                song.classList.add('active');
            } else {
                song.classList.remove('active');
            }
        })
    },

    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        app.updateActiveSong();
        app.scrollToActiveSong();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        app.updateActiveSong();
        app.scrollToActiveSong();
    },

    randomSong: function() {
        let newIndex;
        let count = 0;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
            count++;
        }
        while (newIndex === this.currentIndex || (this.recentlyPlayed.includes(newIndex) && count <= 2));
        
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        app.updateActiveSong();
        app.scrollToActiveSong();
    },

    addToRecentlyPlayed: function() {
        if (this.recentlyPlayed.length >= this.songs.length) {
            this.recentlyPlayed.shift();
            this.recentlyPlayed.push(this.currentIndex);
            
        } else {
            this.recentlyPlayed.push(this.currentIndex);
        }

        console.log(this.recentlyPlayed);
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song-item.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    loadConfig: function() {
        this.isRandom = this.configs.isRandom;
        this.isRepeat = this.configs.isRepeat;

        random.classList.toggle('active', this.isRandom);
        repeat.classList.toggle('active', this.isRepeat);
    },

    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.loadCurrentSong();
        this.handleEvents();

        this.render();
        this.updateActiveSong();
        
    }

}

app.start();
setTimeout(() => {
    alert('Mobile version is not ready yet! Please use PC to enjoy the app!');
}, 1000);


