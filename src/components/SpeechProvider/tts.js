import { normalizeLanguageCode } from '../../i18n';

const synth = window.speechSynthesis;
let voices = [];

const tts = {
  isSupported() {
    return 'speechSynthesis' in window;
  },

  getVoiceByLang(lang) {
    return this.getVoices().then(voices =>
      voices.find(voice => normalizeLanguageCode(voice.lang) === lang)
    );
  },

  getVoiceByVoiceURI(URI) {
    return this.getVoices().then(voices =>
      voices.find(voice => voice.voiceURI === URI)
    );
  },

  getLangs() {
    return this.getVoices().then(voices => {
      const langs = [
        ...new Set(voices.map(voice => normalizeLanguageCode(voice.lang)))
      ];
      return langs;
    });
  },

  getVoices() {
    if (voices.length) {
      return Promise.resolve(voices);
    }

    return new Promise((resolve, reject) => {
      // iOS
      voices = synth.getVoices() || [];
      if (voices.length) {
        resolve(voices);
      }

      // Android
      if ('onvoiceschanged' in synth) {
        speechSynthesis.onvoiceschanged = () => {
          voices = synth.getVoices();
          resolve(voices);
        };
      }
    });
  },

  cancel() {
    synth.cancel();
  },

  speak(text, { voiceURI, pitch = 1, rate = 1, volume = 1 }) {
    this.getVoiceByVoiceURI(voiceURI).then(voice => {
      const msg = new SpeechSynthesisUtterance(text);
      msg.voice = voice;
      msg.name = voice.name;
      msg.lang = voice.lang;
      msg.voiceURI = voiceURI;
      msg.pitch = pitch;
      msg.rate = rate;
      msg.volume = volume;
      synth.speak(msg);
    });
  }
};

export default tts;
