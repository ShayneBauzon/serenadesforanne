const musicPlayer = {
    // Store DOM elements
    playBtn: document.getElementById('play'),
    prevBtn: document.getElementById('prev'),
    nextBtn: document.getElementById('next'),
    title: document.getElementById('title'),
    artist: document.getElementById('artist'),
    cover: document.getElementById('cover'),
    audio: new Audio(),
    progressContainer: document.getElementById('progress-container'),
    progress: document.getElementById('progress'),
    currentTimeEl: document.getElementById('current-time'),
    durationEl: document.getElementById('duration'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    messageEl: document.getElementById('message'),
    
    // Songs data - replace with your own recordings
    songs: [
        {
            title: 'Mr. Loverman',
            artist: 'For My Love',
            coverPath: 'assets/photos/mrloverman.png',
            audioPath: 'assets/audios/mrloverman.mp3' // Add your audio file path here
        },
        {
            title: 'Blue',
            artist: 'For My Love',
            coverPath: 'assets/photos/blue.png',
            audioPath: 'assets/audios/blue.mp3' // Add your audio file path here
        }
        // Add more songs as needed
    ],
    
    // Track current song
    currentSong: 0,
    isPlaying: false,
    
    // Initialize player
    init() {
        this.loadSong(this.songs[this.currentSong]);
        this.addEventListeners();
    },
    
    // Load song details
    loadSong(song) {
        this.title.textContent = song.title;
        this.artist.textContent = song.artist;
        this.cover.src = song.coverPath;
        this.audio.src = song.audioPath;
        
        // Update background when cover loads
        this.cover.onload = () => {
            this.updateBackgroundFromCover();
        };
    },
    
    // Update background based on cover art
    updateBackgroundFromCover() {
        // Create a canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.cover.width;
        canvas.height = this.cover.height;
        
        // Draw the image to canvas
        ctx.drawImage(this.cover, 0, 0, canvas.width, canvas.height);
        
        try {
            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            // Sample pixels from different areas for better color representation
            const pixels = [];
            const numSamples = 10;
            const skipX = Math.floor(canvas.width / numSamples);
            const skipY = Math.floor(canvas.height / numSamples);
            
            for (let x = 0; x < canvas.width; x += skipX) {
                for (let y = 0; y < canvas.height; y += skipY) {
                    const i = (y * canvas.width + x) * 4;
                    if (imageData[i+3] > 128) { // Only include non-transparent pixels
                        pixels.push({
                            r: imageData[i],
                            g: imageData[i+1],
                            b: imageData[i+2]
                        });
                    }
                }
            }
            
            // Calculate average color and a complementary/lighter color for gradient
            let totalR = 0, totalG = 0, totalB = 0;
            pixels.forEach(pixel => {
                totalR += pixel.r;
                totalG += pixel.g;
                totalB += pixel.b;
            });
            
            const avgR = Math.floor(totalR / pixels.length);
            const avgG = Math.floor(totalG / pixels.length);
            const avgB = Math.floor(totalB / pixels.length);
            
            // Create lighter variant for gradient
            const lighterR = Math.min(255, avgR + 50);
            const lighterG = Math.min(255, avgG + 50);
            const lighterB = Math.min(255, avgB + 50);
            
            // Apply gradient to background
            document.body.style.background = `linear-gradient(135deg, 
                rgba(${avgR},${avgG},${avgB},0.9), 
                rgba(${lighterR},${lighterG},${lighterB},0.7), 
                rgba(255,255,255,0.8))`;

            // Update progress bar color to match theme
            this.progress.style.background = `rgb(${avgR},${avgG},${avgB})`;
            
            // Update button colors
            const svgElements = document.querySelectorAll('.controls button svg');
            svgElements.forEach(svg => {
                svg.style.fill = `rgb(${avgR},${avgG},${avgB})`;
            });

        } catch (error) {
            console.error('Error analyzing image:', error);
            // Fallback to default colors if error
            document.body.style.background = 'linear-gradient(135deg, #e0f7fa, #80deea, #b2ebf2, white)';
        }
    },
    
    // Play song
    playSong() {
        this.isPlaying = true;
        this.playIcon.style.display = 'none';
        this.pauseIcon.style.display = 'block';
        this.audio.play();
    },
    
    // Pause song
    pauseSong() {
        this.isPlaying = false;
        this.pauseIcon.style.display = 'none';
        this.playIcon.style.display = 'block';
        this.audio.pause();
    },
    
    // Previous song
    prevSong() {
        this.currentSong--;
        if (this.currentSong < 0) {
            this.currentSong = this.songs.length - 1;
        }
        this.loadSong(this.songs[this.currentSong]);
        if (this.isPlaying) {
            this.playSong();
        }
    },
    
    // Next song
    nextSong() {
        this.currentSong++;
        if (this.currentSong > this.songs.length - 1) {
            this.currentSong = 0;
        }
        this.loadSong(this.songs[this.currentSong]);
        if (this.isPlaying) {
            this.playSong();
        }
    },
    
    // Update progress bar
    updateProgress(e) {
        const { duration, currentTime } = e.target;
        const progressPercent = (currentTime / duration) * 100;
        this.progress.style.width = `${progressPercent}%`;
        
        // Update time display
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) {
            durationSeconds = `0${durationSeconds}`;
        }
        
        // Delay switching duration element to avoid NaN
        if (durationSeconds) {
            this.durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
        }
        
        const currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = Math.floor(currentTime % 60);
        if (currentSeconds < 10) {
            currentSeconds = `0${currentSeconds}`;
        }
        this.currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
    },
    
    // Set progress bar
    setProgress(e) {
        const width = this.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audio.duration;
        
        this.audio.currentTime = (clickX / width) * duration;
    },
    
    // Show message
    showMessage(text) {
        this.messageEl.textContent = text;
        this.messageEl.classList.add('show');
        
        setTimeout(() => {
            this.messageEl.classList.remove('show');
        }, 3000);
    },
    
    // Add all event listeners
    addEventListeners() {
        // Play/pause event
        this.playBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pauseSong();
            } else {
                this.playSong();
            }
        });
        
        // Previous song
        this.prevBtn.addEventListener('click', () => {
            this.prevSong();
        });
        
        // Next song
        this.nextBtn.addEventListener('click', () => {
            this.nextSong();
        });
        
        // Time update
        this.audio.addEventListener('timeupdate', (e) => {
            this.updateProgress(e);
        });
        
        // Click on progress bar
        this.progressContainer.addEventListener('click', (e) => {
            this.setProgress(e);
        });
        
        // Song ends
        this.audio.addEventListener('ended', () => {
            this.nextSong();
        });
        
        // Display a special message when the first song plays
        this.audio.addEventListener('play', () => {
            if (this.currentSong === 0 && this.audio.currentTime < 1) {
                this.showMessage('I love you as endlessly as a field of wildflowers');
            }
        });
    }
};

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer.init();
});
