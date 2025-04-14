const musicContainer = document.getElementById("music-container");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const audio = document.getElementById("audio");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const title = document.getElementById("title");
const cover = document.getElementById("cover");
const currTime = document.getElementById("currTime");
const durTime = document.getElementById("durTime");

// Songs
const songs = [
  "sxkwvs",
  "chop go bing",
  "he is not me",
  "gone gone",
  "ot7remix",
  "vonoff1700 flip",
  "digdatremix",
];
let songIndex = 5;

// Load initial song
loadSong(songs[songIndex]);

function loadSong(song) {
  title.innerText = song;
  audio.src = `music/${song}.wav`;
  cover.src = `images/${song}.jpg`;
}

// Play / Pause
function playSong() {
  musicContainer.classList.add("play");
  playBtn.querySelector("i.fas").classList.replace("fa-play", "fa-pause");
  audio.play().catch((err) => console.error("Playback failed:", err));
}

function pauseSong() {
  musicContainer.classList.remove("play");
  playBtn.querySelector("i.fas").classList.replace("fa-pause", "fa-play");
  audio.pause();
}

function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  loadSong(songs[songIndex]);
  playSong();
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
}

function updateTime(e) {
  const { duration, currentTime } = e.srcElement;
  currTime.innerText = formatTime(currentTime);
  durTime.innerText = isNaN(duration) ? "00:00" : formatTime(duration);
}

// Visualizer
const visualizerElem = document.createElement("canvas");
visualizerElem.width = 640;
visualizerElem.height = 150;
musicContainer.appendChild(visualizerElem);

let audioContext = null;

function createVisualizer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const src = audioContext.createMediaElementSource(audio);
  const analyzer = audioContext.createAnalyser();
  const canvas = visualizerElem;
  const ctx = canvas.getContext("2d");

  src.connect(analyzer);
  analyzer.connect(audioContext.destination);

  analyzer.fftSize = 128;
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const barWidth = (canvas.width / bufferLength) * 2.5;

  function renderFrame() {
    requestAnimationFrame(renderFrame);

    analyzer.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let bar = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] - 125;
      const r = barHeight + 25 * (i / bufferLength);
      ctx.fillStyle = `rgb(${r}, 20, 50)`;
      ctx.fillRect(bar, canvas.height - barHeight, barWidth, barHeight);
      bar += barWidth + 2;
    }
  }

  renderFrame();
}

// Event listeners
playBtn.addEventListener("click", () => {
  const isPlaying = musicContainer.classList.contains("play");
  if (!audioContext) createVisualizer();
  isPlaying ? pauseSong() : playSong();
});

prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("timeupdate", updateTime);
progressContainer.addEventListener("click", setProgress);
audio.addEventListener("ended", nextSong);
