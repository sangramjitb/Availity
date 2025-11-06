// Hidden music player logic
// Playlist: dynamically generated from /music folder assuming files named song1.mp3 to song32.mp3.
// Adjust the generatePlaylist function if your naming pattern differs.

function generatePlaylist() {
  const playlist = [];
  // Assuming songs are named song1.mp3 to song32.mp3. Adjust range as needed.
  for (let i = 1; i <= 29; i++) {
    playlist.push(`music/song${i}.mp3`);
  }
  return playlist;
}

// Shuffle function (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let playlist = generatePlaylist(); // Dynamically generate
playlist = shuffleArray(playlist); // Shuffle on load

const audio = document.getElementById('audioPlayer');
let current = 0;
let fading = false;

function loadTrack(index) {
  if (index < 0 || index >= playlist.length) {
    // For shuffle, pick random if out of bounds
    index = Math.floor(Math.random() * playlist.length);
  }
  current = index;
  audio.src = playlist[current];
}

function playTrack() {
  if (!audio.src) loadTrack(current);
  // fade-in manually by ramping volume
  audio.volume = 0;
  audio.play().then(() => {
    fading = true;
    const fadeInterval = setInterval(() => {
      audio.volume = Math.min(1, audio.volume + 0.05);
      if (audio.volume >= 0.99) { clearInterval(fadeInterval); fading = false; }
    }, 70);
  }).catch((e) => {
    console.warn('Playback failed:', e);
    // On failure, try next random track
    nextTrack();
  });
}

function pauseTrack() {
  if (audio.paused) return;
  // fade-out then pause
  fading = true;
  const fadeInterval = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - 0.05);
    if (audio.volume <= 0.02) { clearInterval(fadeInterval); audio.pause(); fading = false; }
  }, 70);
}

function nextTrack() {
  fadeThen(() => { loadTrack(Math.floor(Math.random() * playlist.length)); playTrack(); });
}

function prevTrack() {
  fadeThen(() => { loadTrack(Math.floor(Math.random() * playlist.length)); playTrack(); });
}

function fadeThen(cb) {
  if (fading) { return; }
  // if not playing, just call
  if (audio.paused || audio.volume <= 0.01) { cb(); return; }
  // fade out quickly
  let intv = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - 0.07);
    if (audio.volume <= 0.02) { clearInterval(intv); audio.pause(); audio.currentTime = 0; audio.volume = 1; cb(); }
  }, 60);
}

// Map UI actions to player controls secretly
const signIn = document.getElementById('signIn');
const forgot = document.getElementById('forgot');
const help = document.getElementById('help');
const eye = document.querySelector('.eye');

signIn.addEventListener('click', (e) => {
  e.preventDefault();
  // visually show a small pressed state
  signIn.classList.add('pressed');
  setTimeout(() => signIn.classList.remove('pressed'), 200);
  // Start playback (acts like "login")
  if (audio.paused) { playTrack(); } else { pauseTrack(); }
});

// forgot -> previous ("Forgot your user ID?" -> previous)
forgot.addEventListener('click', (e) => { e.preventDefault(); prevTrack(); });
// help -> next ("Forgot your password?" -> next)
help.addEventListener('click', (e) => { e.preventDefault(); nextTrack(); });
// eye button toggles play/pause
eye.addEventListener('click', () => {
  if (audio.paused) playTrack(); else pauseTrack();
});

// Auto-advance on ended (now random for shuffle)
audio.addEventListener('ended', () => { loadTrack(Math.floor(Math.random() * playlist.length)); playTrack(); });

// Initialize first track silently
loadTrack(0);

// Small accessibility: allow keyboard Enter on form to trigger sign in behavior
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => { e.preventDefault(); signIn.click(); });

// Expose some debug helpers on window (hidden functions if someone opens console)
window._player = {
  play: playTrack,
  pause: pauseTrack,
  next: nextTrack,
  prev: prevTrack,
  playlist,
  currentIndex: () => current
};

// If a track is not found, the console will show an error. Ensure files exist in /music



