const trackArtImg = document.getElementById('track-art-img');
const trackName = document.getElementById('track-name');
const trackArtist = document.getElementById('track-artist');

const playpauseBtn = document.getElementById('playpause-track');
const nextBtn = document.getElementById('next-track');
const prevBtn = document.getElementById('prev-track');

const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');

const musicAudio = document.getElementById('music-audio');

let trackIndex = 0;
let isPlaying = false;
let updateTimer;

// Lista de músicas de exemplo
const trackList = [
    {
        name: 'Summer Haze',
        artist: 'The Lumineers',
        image: 'https://images.unsplash.com/photo-1517457335607-b3531f81014a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzNzB8MHwxfHNlYXJjaHw4fHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MHx8fHwxNzA3NjQ1NTQ2fDA&ixlib=rb-4.0.3&q=80&w=400',
        path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Link de exemplo de MP3
    },
    {
        name: 'Midnight Drive',
        artist: 'Chillwave Collective',
        image: 'https://images.unsplash.com/photo-1549422055-6ff42079f225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzNzB8MHwxfHNlYXJjaHw3fHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MHx8fHwxNzA3NjQ1NTQ2fDA&ixlib=rb-4.0.3&q=80&w=400',
        path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' // Link de exemplo de MP3
    },
    {
        name: 'Acoustic Dreams',
        artist: 'Melody Makers',
        image: 'https://images.unsplash.com/photo-1511379938542-a1f4872ef3e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTQzNzB8MHwxfHNlYXJjaHw2fHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MHx8fHwxNzA3NjQ1NTQ2fDA&ixlib=rb-4.0.3&q=80&w=400',
        path: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' // Link de exemplo de MP3
    }
    // Adicione mais músicas aqui com seus respectivos caminhos, nomes e artistas
];

function loadTrack(index) {
    clearInterval(updateTimer); // Limpa o timer anterior
    resetValues();

    musicAudio.src = trackList[index].path;
    musicAudio.load(); // Carrega a música

    trackArtImg.src = trackList[index].image;
    trackName.textContent = trackList[index].name;
    trackArtist.textContent = trackList[index].artist;

    // Atualiza o timer a cada segundo
    updateTimer = setInterval(seekUpdate, 1000);

    // Quando a música termina, toca a próxima
    musicAudio.addEventListener('ended', nextTrack);
}

function resetValues() {
    currentTimeEl.textContent = "00:00";
    totalDurationEl.textContent = "00:00";
    progressBar.style.width = "0%";
}

function playpauseTrack() {
    if (!isPlaying) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function playTrack() {
    musicAudio.play();
    isPlaying = true;
    playpauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; // Altera para ícone de pause
}

function pauseTrack() {
    musicAudio.pause();
    isPlaying = false;
    playpauseBtn.innerHTML = '<i class="fas fa-play"></i>'; // Altera para ícone de play
}

function nextTrack() {
    if (trackIndex < trackList.length - 1) {
        trackIndex += 1;
    } else {
        trackIndex = 0; // Volta para a primeira música
    }
    loadTrack(trackIndex);
    playTrack();
}

function prevTrack() {
    if (trackIndex > 0) {
        trackIndex -= 1;
    } else {
        trackIndex = trackList.length - 1; // Volta para a última música
    }
    loadTrack(trackIndex);
    playTrack();
}

function seek(event) {
    const progressBarContainer = document.querySelector('.progress-container');
    const clickX = event.clientX - progressBarContainer.getBoundingClientRect().left;
    const width = progressBarContainer.offsetWidth;
    const duration = musicAudio.duration;

    if (!isNaN(duration)) {
        musicAudio.currentTime = (clickX / width) * duration;
    }
}

function setVolume() {
    musicAudio.volume = volumeSlider.value;
}

function seekUpdate() {
    let seekPosition = 0;

    if (!isNaN(musicAudio.duration)) {
        seekPosition = musicAudio.currentTime * (100 / musicAudio.duration);
        progressBar.style.width = seekPosition + "%";

        // Calcula e formata o tempo atual e a duração total
        let currentMinutes = Math.floor(musicAudio.currentTime / 60);
        let currentSeconds = Math.floor(musicAudio.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(musicAudio.duration / 60);
        let durationSeconds = Math.floor(musicAudio.duration - durationMinutes * 60);

        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

        currentTimeEl.textContent = currentMinutes + ":" + currentSeconds;
        totalDurationEl.textContent = durationMinutes + ":" + durationSeconds;
    }
}

// Event Listeners
playpauseBtn.addEventListener('click', playpauseTrack);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
volumeSlider.addEventListener('input', setVolume);

// Carrega a primeira música ao iniciar
loadTrack(trackIndex);