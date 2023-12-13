document.addEventListener('DOMContentLoaded', function () {
  const player = document.querySelector('.player');
  const progressBar = document.querySelector('.prog-bar-inner');
  const playButton = document.querySelector('.button-lg');
  const skipBackButton = document.querySelector('.button-md');
  const skipForwardButton = document.querySelector('.button-fd'); 
  const randomButton = document.querySelector('.button-sm'); 
  const repeatButton = document.querySelector('.button-sm.repeat');
  const audio = new Audio(); 
  let isPlaying = false;
  let currentSongIndex = 0;
  let isRepeat = false;
  let isRandom = false;
  const songList = [
    {
      title: 'Dancing With Your Ghost',
      file: 'audio/dancingwithyourghost.mp3'
    }
    // Add more songs here...
  ];

  const songNameDisplay = document.querySelector('.song-name');

  function loadSong(index) {
    currentSongIndex = index;
    audio.src = songList[index].file;
    songNameDisplay.textContent = songList[index].title;
    playAudio();
  }

  function playAudio() {
    audio.play();
    playButton.querySelector('i').classList.remove('fa-play');
    playButton.querySelector('i').classList.add('fa-pause');
    drawSoundVisualizer();
    isPlaying = true;
  }

  function pauseAudio() {
    audio.pause();
    playButton.querySelector('i').classList.remove('fa-pause');
    playButton.querySelector('i').classList.add('fa-play');
    isPlaying = false;
  }

  function togglePlay() {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
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

  function playRandom() {
    isRandom = !isRandom; 
  
    if (isRandom) {
      loadRandomSong(); 
      const icon = randomButton.querySelector('i');
      icon.classList.remove('fa-random');
      icon.classList.add('fa-exchange-alt');
    } else {
      const icon = randomButton.querySelector('i');
      icon.classList.remove('fa-exchange-alt');
      icon.classList.add('fa-random');
    }
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
  
    const icon = repeatButton.querySelector('i');

    if (isRepeat) {
      icon.classList.remove('fa-repeat');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-repeat');
    }
  }
  
  playButton.addEventListener('click', togglePlay);
  skipBackButton.addEventListener('click', skipBack);
  skipForwardButton.addEventListener('click', skipForward);
  randomButton.addEventListener('click', playRandom);
  repeatButton.addEventListener('click', toggleRepeat);

  audio.addEventListener('ended', function() {
    isPlaying = false;
    playButton.querySelector('i').classList.remove('fa-pause');
    playButton.querySelector('i').classList.add('fa-play');
    songNameDisplay.textContent = 'SoundSurge';
    progressBar.style.width = '0%';
  
    if (isRandom) {
      loadRandomSong(); 
    } else {
      currentSongIndex = (currentSongIndex + 1) % songList.length;
      loadSong(currentSongIndex);
    }
  });
  
  function updateProgressBar() {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progress = (currentTime / duration) * 100;
  
    progressBar.style.width = progress + '%';
  }
  
  setInterval(updateProgressBar, 500);

  audio.addEventListener('timeupdate', updateProgressBar);
  
  // Sound Visualizer
  const canvas = document.getElementById('soundVisualizer');
  const ctx = canvas.getContext('2d');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const audioSource = audioContext.createMediaElementSource(audio);

  audioSource.connect(analyser);
  audioSource.connect(audioContext.destination);

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function drawSoundVisualizer() {
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let posX = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] * 1;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.93)'); // Start color
      gradient.addColorStop(1, 'rgb(63, 61, 61)'); // End color
  
      ctx.fillStyle = gradient;
      ctx.fillRect(posX, canvas.height - barHeight / 2, barWidth, barHeight);
  
      posX += barWidth + 1;
    }
    requestAnimationFrame(drawSoundVisualizer);
  }

  audio.play();
  drawSoundVisualizer();
});
