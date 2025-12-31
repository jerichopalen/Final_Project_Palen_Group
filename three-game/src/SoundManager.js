// Sound Manager for game audio effects
export class SoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Play a coin/step sound - high pitched beep
  playCoinSound() {
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // Play ladder climb sound - ascending tones
  playLadderSound() {
    const now = this.audioContext.currentTime;
    const notes = [523.25, 587.33, 659.25]; // C, D, E notes
    
    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const startTime = now + (index * 0.1);
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    });
  }

  // Play snake bite sound - descending tones with buzzer effect
  playSnakeSound() {
    const now = this.audioContext.currentTime;
    const notes = [400, 300, 200]; // Descending tones
    
    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const startTime = now + (index * 0.15);
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = 'square'; // Buzzer-like sound
      oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  // Play champion/winner sound - triumphant fanfare
  playChampionSound() {
    const now = this.audioContext.currentTime;
    const notes = [
      { freq: 523.25, duration: 0.2 },   // C
      { freq: 659.25, duration: 0.2 },   // E
      { freq: 783.99, duration: 0.3 },   // G
      { freq: 1047.00, duration: 0.5 },  // High C (winner!)
    ];
    
    notes.forEach((note, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const startTime = now + notes.slice(0, index).reduce((sum, n) => sum + n.duration, 0);
      oscillator.frequency.setValueAtTime(note.freq, startTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
    });
  }
}
