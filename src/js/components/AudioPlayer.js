import React from "react";

// import "../sass/AudioPlayer.sass";

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.audio = new Audio(this.props.audiosrc);
    this.changeTime = this.changeTime.bind(this);
    this.dragTime = this.dragTime.bind(this);
    this.setDuration = this.setDuration.bind(this);
    this.setupAudio();
    this.state = {
      playing: false,
      duration: 0,
      currentTime: 0,
      volume: 0,
      fadeInterval: null,
      slider: 0
    };
  }

  fadeInAndPlay() {
    this.audio.play();
    const steps = 10;
    const step = 1.0 / steps;
    const timeStep = this.props.fadeDuration / steps;
    clearInterval(this.state.fadeInterval);
    const intv = setInterval(() => {
      if (this.state.volume >= 1.0) {
        clearInterval(this.state.fadeInterval);
        this.setState(state => ({ volume: 1 }));
      } else {
        this.setState(state => ({ volume: this.state.volume + step }));
        this.audio.volume = Math.min(this.state.volume, 1.0);
      }
    }, timeStep);
    this.setState(state => ({ fadeInterval: intv }));
  }

  fadeOutAndStop() {
    const steps = 10;
    const step = 1.0 / steps;
    const timeStep = this.props.fadeDuration / steps;
    clearInterval(this.state.fadeInterval);
    const intv = setInterval(() => {
      if (this.state.volume <= 0.0) {
        clearInterval(this.state.fadeInterval);
        this.setState(state => ({ volume: 0 }));
        this.audio.pause();
      } else {
        this.setState(state => ({ volume: this.state.volume - step }));
        this.audio.volume = Math.max(this.state.volume, 0.0);
      }
    }, timeStep);
    this.setState(state => ({ fadeInterval: intv }));
  }

  componentWillUnmount() {
    this.audio.ontimeupdate = null;
    this.audio.removeEventListener("canplaythrough", this.setDuration);
    clearInterval(this.state.fadeInterval);
  }

  setDuration() {
    this.setState({
      duration: this.audio.duration
    });
  }

  setupAudio() {
    this.audio.loop = true;
    this.audio.volume = 0.0;
    this.audio.addEventListener("canplaythrough", this.setDuration);
    this.audio.ontimeupdate = this.timeUpdate.bind(this);
    this.audio.src = this.props.audiosrc;
  }

  stopAudio() {
    const steps = 10;
    const step = 1.0 / steps;
    const timeStep = this.props.fadeDuration / steps;
    clearInterval(this.state.fadeInterval);
    const intv = setInterval(() => {
      if (this.state.volume < 0.0) {
        clearInterval(this.state.fadeInterval);
        this.audio.pause();
        this.setState(state => ({ volume: 0 }));
        this.audio.volume = this.state.volume;
        this.audio.src = this.props.audiosrc;
        this.props.onStopped();
      } else {
        this.setState(state => ({ volume: this.state.volume - step }));
        this.audio.volume = Math.max(this.state.volume, 0.0);
      }
    }, timeStep);
    this.setState(state => ({ fadeInterval: intv }));
  }

  timeUpdate() {
    this.setState(state => ({
      currentTime: this.audio.currentTime
    }));
  }

  changeTime(e) {
    var xOffset = e.target.getBoundingClientRect().left;
    const percent =
      (e.clientX - xOffset) / e.target.getBoundingClientRect().width;
    this.audio.currentTime = this.state.duration * percent;
  }

  dragTime(e) {}

  render() {
    const debug = (
      <div className="column">
        <span>
          <b>Sample: </b>
          {this.props.audiosrc}
        </span>
        <span>
          <b>Volume:</b> {this.state.volume}
        </span>
        <span>
          {this.state.currentTime}/{this.state.duration}
        </span>
      </div>
    );

    const cx = 0;
    const cy = 0;
    const r = 50;
    const range = this.state.currentTime / this.state.duration;
    const startX = cx + r;
    const startY = cy;
    const endX = cx + r + r * Math.sin(range * Math.PI * 2.0);
    const endY = cy + r - r * Math.cos(range * Math.PI * 2.0);
    const way = range >= 0.5 ? 1 : 0;
    const sweep = range > 0 || range === 1.0 ? 1 : 0;

    const left =
      this.state.currentTime / this.state.duration
        ? (this.state.currentTime / this.state.duration) * 100
        : 0;
    return (
      <div className="audio-player">
        <svg width={200} height={200}>
          <g
            stroke="var(--color-darkness)"
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            transform="translate(50, 50)"
          >
            <circle
              cx={cx + r}
              cy={cy + r}
              r={r}
              fill="none"
              strokeWidth="2"
              stroke="var(--color-dirtysnow)"
            />
            <path
              d={`M ${startX} ${startY} A ${r} ${r} 0 ${way} ${sweep} ${endX} ${endY}`}
            />
            <polygon
              style={{ cursor: "pointer" }}
              transform={`translate(${cx + r / 2},${cy + r / 2})`}
              points={
                this.state.playing
                  ? "12.5,12.5 37.5,12.5 37.5,37.5 12.5,37.5"
                  : "14.5,5 45,25 45,25 14.5,45"
              }
              fill="var(--color-curacao)"
              stroke="none"
              onClick={e => {
                this.setState({ playing: !this.state.playing });
                this.state.playing
                  ? this.fadeOutAndStop()
                  : this.fadeInAndPlay();
              }}
            ></polygon>
          </g>
        </svg>
        {/* {debug} */}
      </div>
    );
  }
}

export default AudioPlayer;
