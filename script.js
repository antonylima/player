const API_URL = "https://player.somnacity.com.br/api/api.php";
const BASE_MUSIC_URL = "https://player.somnacity.com.br/music/";

const audio = document.getElementById("audio");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const trackAlbum = document.getElementById("trackAlbum");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const volume = document.getElementById("volume");
const balance = document.getElementById("balance");
const speed = document.getElementById("speed");
const library = document.getElementById("library");
const connectionStatus = document.getElementById("connectionStatus");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

let tracks = [];
let currentIndex = -1;
let shuffleMode = false;
let repeatMode = "off"; // off | one | all

let audioContext;
let panNode;

const initAudioContext = () => {
  if (audioContext) return;
  try {
    audio.crossOrigin = "anonymous";
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = audioContext.createMediaElementSource(audio);
    panNode = audioContext.createStereoPanner();
    sourceNode.connect(panNode).connect(audioContext.destination);
  } catch (error) {
    audioContext = null;
    panNode = null;
  }
};

const ensureAudioContext = () => {
  initAudioContext();
  if (!audioContext) return Promise.resolve();
  return audioContext.state === "suspended"
    ? audioContext.resume()
    : Promise.resolve();
};

const formatTime = (time) => {
  if (!Number.isFinite(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const cleanFolderName = (folder) =>
  folder.replace("../music/", "").replace(/\/$/, "");

const buildTrackUrl = (folder, file) => {
  const cleanFolder = cleanFolderName(folder);
  const segments = cleanFolder
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment));
  return `${BASE_MUSIC_URL}${segments.join("/")}/${encodeURIComponent(file)}`;
};

const parseArtistTitle = (fileName) => {
  const withoutExt = fileName.replace(/\.mp3$/i, "");
  if (withoutExt.includes(" - ")) {
    const [artist, title] = withoutExt.split(" - ");
    return { artist, title };
  }
  return { artist: "SomnaCity", title: withoutExt };
};

const updateTrackInfo = (track) => {
  const { artist, title } = parseArtistTitle(track.file);
  trackTitle.textContent = title;
  trackArtist.textContent = artist;
  trackAlbum.textContent = cleanFolderName(track.folder);
};

const setActiveItem = (index) => {
  document
    .querySelectorAll(".track-item")
    .forEach((item) => item.classList.remove("active"));
  const active = document.querySelector(`[data-index="${index}"]`);
  if (active) active.classList.add("active");
};

const loadTrack = (index, autoplay = true) => {
  const track = tracks[index];
  if (!track) return;
  currentIndex = index;
  audio.crossOrigin = "anonymous";
  audio.src = track.url;
  updateTrackInfo(track);
  setActiveItem(index);
  if (autoplay) {
    ensureAudioContext()
      .then(() => audio.play())
      .catch(() => {});
  }
};

const playNext = () => {
  if (tracks.length === 0) return;
  if (shuffleMode) {
    const nextIndex = Math.floor(Math.random() * tracks.length);
    loadTrack(nextIndex);
    return;
  }
  const nextIndex = currentIndex + 1;
  if (nextIndex < tracks.length) {
    loadTrack(nextIndex);
  } else if (repeatMode === "all") {
    loadTrack(0);
  } else {
    audio.pause();
  }
};

const playPrev = () => {
  if (tracks.length === 0) return;
  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    loadTrack(prevIndex);
  } else if (repeatMode === "all") {
    loadTrack(tracks.length - 1);
  }
};

const stopPlayback = () => {
  audio.pause();
  audio.currentTime = 0;
};

const updateRepeatLabel = () => {
  const label =
    repeatMode === "off"
      ? "Repeat: Off"
      : repeatMode === "one"
      ? "Repeat: Faixa"
      : "Repeat: All";
  repeatBtn.textContent = label;
};

const renderLibrary = (data) => {
  library.innerHTML = "";
  tracks = [];
  let index = 0;
  Object.entries(data).forEach(([folder, files]) => {
    const folderEl = document.createElement("div");
    folderEl.className = "folder";

    const title = document.createElement("div");
    title.className = "folder-title";
    title.textContent = cleanFolderName(folder);

    const list = document.createElement("ul");
    list.className = "track-list";

    files.forEach((file) => {
      const item = document.createElement("li");
      item.className = "track-item";
      item.dataset.index = index;

      const { artist, title: songTitle } = parseArtistTitle(file);
      item.innerHTML = `
        <span>${songTitle}</span>
        <span class="track-meta">${artist}</span>
      `;
      item.addEventListener("click", () => loadTrack(index));
      list.appendChild(item);

      tracks.push({
        folder,
        file,
        url: buildTrackUrl(folder, file),
      });
      index += 1;
    });

    folderEl.appendChild(title);
    folderEl.appendChild(list);
    library.appendChild(folderEl);
  });

  if (tracks.length > 0) {
    loadTrack(0, false);
  }
};

const fetchLibrary = async () => {
  try {
    connectionStatus.textContent = "Carregando";
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao carregar API");
    const data = await response.json();
    renderLibrary(data);
    connectionStatus.textContent = "Online";
  } catch (error) {
    connectionStatus.textContent = "Offline";
    library.innerHTML =
      "<p class=\"track-meta\">Não foi possível carregar a biblioteca.</p>";
  }
};

playBtn.addEventListener("click", () => {
  if (!audio.src && tracks.length > 0) {
    loadTrack(0);
    return;
  }
  if (audio.src) {
    ensureAudioContext()
      .then(() => audio.play())
      .catch(() => {});
  }
});

pauseBtn.addEventListener("click", () => audio.pause());
stopBtn.addEventListener("click", stopPlayback);
prevBtn.addEventListener("click", playPrev);
nextBtn.addEventListener("click", playNext);

shuffleBtn.addEventListener("click", () => {
  shuffleMode = !shuffleMode;
  shuffleBtn.classList.toggle("active", shuffleMode);
});

repeatBtn.addEventListener("click", () => {
  repeatMode =
    repeatMode === "off" ? "one" : repeatMode === "one" ? "all" : "off";
  repeatBtn.classList.toggle("active", repeatMode !== "off");
  updateRepeatLabel();
});

volume.addEventListener("input", (event) => {
  audio.volume = Number(event.target.value);
});

balance.addEventListener("input", (event) => {
  if (!panNode) return;
  panNode.pan.value = Number(event.target.value);
});

speed.addEventListener("input", (event) => {
  audio.playbackRate = Number(event.target.value);
});

progressBar.addEventListener("input", (event) => {
  if (!Number.isFinite(audio.duration)) return;
  const percent = Number(event.target.value) / 100;
  audio.currentTime = audio.duration * percent;
});

audio.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
  if (Number.isFinite(audio.duration)) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("error", () => {
  connectionStatus.textContent = "Erro ao tocar";
});

audio.addEventListener("ended", () => {
  if (repeatMode === "one") {
    loadTrack(currentIndex);
  } else {
    playNext();
  }
});

fetchLibrary();
updateRepeatLabel();
