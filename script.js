// Hidden music player logic
// Playlist: list local files inside the /music folder relative to this HTML file.
// Edit this array to add more tracks, or put files named song1.mp3, song2.mp3 as shown.
const playlist = [
 
  'music/song7.mp3',
  'music/song8.mp3',
  'music/song9.mp3',
  'music/song10.mp3',
  'music/song11.mp3',
  'music/song12.mp3',
  'music/song13.mp3',
  'music/song6.mp3',
  'music/song14.mp3',
    'music/song15.mp3',
  'music/song16.mp3',
  'music/song17.mp3',
  'music/song18.mp3',
   'music/song2.mp3',
  'music/song19.mp3',
  'music/song20.mp3',
  'music/song21.mp3',
  'music/song22.mp3',
  'music/song23.mp3',
   'music/song1.mp3',
  'music/song24.mp3',
  'music/song25.mp3',
  'music/song5.mp3',
  'music/song26.mp3',
  'music/song27.mp3',
  'music/song28.mp3',
  'music/song29.mp3',
    'music/song4.mp3',
  'music/song30.mp3',
  'music/song31.mp3',
  'music/song32.mp3',
   'music/song3.mp3'



];

const audio = document.getElementById('audioPlayer');
let current = 0;
let fading = false;

function loadTrack(index){
  if(index<0) index = playlist.length-1;
  if(index>=playlist.length) index = 0;
  current = index;
  audio.src = playlist[current];
}

function playTrack(){
  if(!audio.src) loadTrack(current);
  // fade-in manually by ramping volume
  audio.volume = 0;
  audio.play().then(()=>{
    fading = true;
    const fadeInterval = setInterval(()=>{
      audio.volume = Math.min(1, audio.volume + 0.05);
      if(audio.volume>=0.99){ clearInterval(fadeInterval); fading=false }
    },70);
  }).catch((e)=>{
    console.warn('Playback failed:',e);
  });
}

function pauseTrack(){
  if(audio.paused) return;
  // fade-out then pause
  fading = true;
  const fadeInterval = setInterval(()=>{
    audio.volume = Math.max(0, audio.volume - 0.05);
    if(audio.volume<=0.02){ clearInterval(fadeInterval); audio.pause(); fading=false }
  },70);
}

function nextTrack(){
  fadeThen(()=>{ loadTrack(current+1); playTrack(); });
}

function prevTrack(){
  fadeThen(()=>{ loadTrack(current-1); playTrack(); });
}

function fadeThen(cb){
  if(fading){ return }
  // if not playing, just call
  if(audio.paused || audio.volume<=0.01){ cb(); return }
  // fade out quickly
  let intv = setInterval(()=>{
    audio.volume = Math.max(0, audio.volume - 0.07);
    if(audio.volume<=0.02){ clearInterval(intv); audio.pause(); audio.currentTime = 0; audio.volume=1; cb(); }
  },60);
}

// Map UI actions to player controls secretly
const signIn = document.getElementById('signIn');
const forgot = document.getElementById('forgot');
const help = document.getElementById('help');
const eye = document.querySelector('.eye');

signIn.addEventListener('click', (e)=>{
  e.preventDefault();
  // visually show a small pressed state
  signIn.classList.add('pressed');
  setTimeout(()=>signIn.classList.remove('pressed'),200);
  // Start playback (acts like "login")
  if(audio.paused){ playTrack(); } else { pauseTrack(); }
});

// forgot -> previous ("Forgot your user ID?" -> previous)
forgot.addEventListener('click',(e)=>{ e.preventDefault(); prevTrack(); });
// help -> next ("Forgot your password?" -> next)
help.addEventListener('click',(e)=>{ e.preventDefault(); nextTrack(); });
// eye button toggles play/pause
eye.addEventListener('click',()=>{
  if(audio.paused) playTrack(); else pauseTrack();
});

// Auto-advance on ended
audio.addEventListener('ended',()=>{ loadTrack(current+1); playTrack(); });

// Initialize first track silently
loadTrack(0);

// Small accessibility: allow keyboard Enter on form to trigger sign in behavior
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit',(e)=>{ e.preventDefault(); signIn.click(); });

// Expose some debug helpers on window (hidden functions if someone opens console)
window._player = {
  play: playTrack,
  pause: pauseTrack,
  next: nextTrack,
  prev: prevTrack,
  playlist,
  currentIndex: ()=>current
};

// If a track is not found, the console will show an error. Ensure files exist in /music



