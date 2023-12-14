class SoundManager {
    constructor() {
        this.clips = {};
        this.context = null;
        this.gainNode = null;
        this.loaded = false;
        this.sounds = ['bonus.wav', 'fail.wav', 'hit.wav', 'success.wav'];
    }

    init() {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
    }

    load(path, callback) {
        if (this.clips[path]) {
            callback(this.clips[path]);
            return;
        }

        const clip = {path: path, buffer: null, loaded: false};

        clip.play =  (volume, loop) => {
            this.play(clip.path, {looping: loop ? loop : false, volume: volume ? volume : 1});
        };

        this.clips[path] = clip;

        const request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            this.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };
        request.send();
    }

    loadArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.load(array[i], () => {
                if (array.length === Object.keys(this.clips).length) {
                    for (let sd in this.clips) {
                        if (!this.clips[sd].loaded) return;
                    }
                    this.loaded = true;
                }
            });
        }

        for (const path of array) {
            this.load(path, () => {
                if (array.length === Object.keys(this.clips).length) {
                    for (const sd in this.clips) {
                        if (!this.clips[sd].loaded) return;
                    }
                    this.loaded = true;
                }
            });
        }
    }

    play(path, settings) {
        if (!this.loaded) {
            setTimeout(() => {
                this.play(path, settings);
            }, 1000);
            return;
        }


        let looping = false;
        let volume = 1;

        if (settings) {
            if (settings.looping) looping = settings.looping;
            if (settings.volume) volume = settings.volume;
        }

        const sd = this.clips[path];

        if (sd === null)
            return false;

        const sound = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }
}

const soundManager = new SoundManager();
export default soundManager;