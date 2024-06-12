document.addEventListener('DOMContentLoaded', function () {
  const player = document.querySelector('.player');
  const progressBar = document.querySelector('.prog-bar-inner');
  const playButton = document.querySelector('.button-lg');
  const skipBackButton = document.querySelector('.button-md');
  const skipForwardButton = document.querySelector('.button-fd');
  const randomButton = document.querySelector('.button-sm');
  const repeatButton = document.querySelector('.button-sm.repeat');
  const audio = new Audio();
  const songNameDisplay = document.querySelector('.song-name');
  const canvas = document.getElementById('soundVisualizer');
  const ctx = canvas.getContext('2d');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const audioSource = audioContext.createMediaElementSource(audio);

  let isPlaying = false;
  let currentSongIndex = 0;
  let isRepeat = false;
  let isRandom = false;
  const songList = [
    { title: 'Papa Ki Pari', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/Papa%20Ki%20Pari.mp3' },
    { title: 'Dancing With Your Ghost', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/dancingwithyourghost.mp3' },
    { title: 'Audio 1', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/music-1.mp3' },
    { title: 'Audio 2', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/music-2.mp3' },
    { title: 'Audio 3', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/music-3.mp3' },
    { title: 'Audio 4', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/music-4.mp3' },
    { title: 'Audio 5', file: 'https://raw.githubusercontent.com/yourusername/yourrepository/main/audio/music-5.mp3' },
    // Add more songs here...
  ];

  audioSource.connect(analyser);
  audioSource.connect(audioContext.destination);
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function loadSong(index) {
    currentSongIndex = index;
    audio.src = songList[index].file;
    songNameDisplay.textContent = songList[index].title;
    playAudio();
  }

  function playAudio() {
    audio.play().then(() => {
      playButton.querySelector('i').classList.replace('fa-play', 'fa-pause');
      drawSoundVisualizer();
      isPlaying = true;
    }).catch(error => console.error('Error playing audio:', error));
  }

  function pauseAudio() {
    audio.pause();
    playButton.querySelector('i').classList.replace('fa-pause', 'fa-play');
    isPlaying = false;
  }

  function togglePlay() {
    isPlaying ? pauseAudio() : playAudio();
  }

  function skipBack() {
    if (audio.currentTime / audio.duration < 0.05) {
      currentSongIndex = (currentSongIndex - 1 + songList.length) % songList.length;
      loadSong(currentSongIndex);
    } else {
      audio.currentTime = 0;
    }
  }

  function skipForward() {
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    loadSong(currentSongIndex);
  }

  function toggleRandom() {
    isRandom = !isRandom;
    randomButton.querySelector('i').classList.toggle('fa-exchange-alt', isRandom);
    randomButton.querySelector('i').classList.toggle('fa-random', !isRandom);
    if (isRandom) loadRandomSong();
  }

  function loadRandomSong() {
    if (isRandom) {
      const randomIndex = Math.floor(Math.random() * songList.length);
      loadSong(randomIndex);
    }
  }

  function toggleRepeat() {
    isRepeat = !isRepeat;
    audio.loop = isRepeat;
    repeatButton.querySelector('i').classList.toggle('fa-times', isRepeat);
    repeatButton.querySelector('i').classList.toggle('fa-repeat', !isRepeat);
  }

  function updateProgressBar() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function drawSoundVisualizer() {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let posX = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.93)');
      gradient.addColorStop(1, 'rgb(63, 61, 61)');

      ctx.fillStyle = gradient;
      ctx.fillRect(posX, canvas.height - barHeight / 2, barWidth, barHeight);
      posX += barWidth + 1;
    }

    if (isPlaying) {
      requestAnimationFrame(drawSoundVisualizer);
    }
  }

  playButton.addEventListener('click', togglePlay);
  skipBackButton.addEventListener('click', skipBack);
  skipForwardButton.addEventListener('click', skipForward);
  randomButton.addEventListener('click', toggleRandom);
  repeatButton.addEventListener('click', toggleRepeat);
  audio.addEventListener('timeupdate', updateProgressBar);
  audio.addEventListener('ended', () => {
    isPlaying = false;
    playButton.querySelector('i').classList.replace('fa-pause', 'fa-play');
    songNameDisplay.textContent = 'SoundSurge';
    progressBar.style.width = '0%';
    isRandom ? loadRandomSong() : skipForward();
  });

  loadSong(currentSongIndex);
});
