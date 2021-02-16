// node_modules imports
import React, { createRef } from "react";
import ReactDOM from "react-dom";
import p5 from "p5";
import PoissonDiskSampling from "poisson-disk-sampling";
import dat from "dat.gui";
// Local imports
import "../p5/p5.sound.min.js";
// Style imports
import "../../sass/6-components/Dot.sass";

const selectionType = {
  SONG: "song",
  MIC: "mic",
  FILE: "file",
};

class Dot extends React.Component {
  constructor(props) {
    super(props);
    this.sketchRef = createRef();
    this.onFileUpload = this.onFileUpload.bind(this);
    this.state = {
      selection: undefined,
    };
    /*
    const gui = new dat.GUI();
    const settings = {
      radius: 15,
      binSize: 3,
    };
    gui
      .add(settings, "radius")
      .min(5)
      .max(20)
      .step(1)
      .onChange((v) => {
        this.sketch.radius = v;
        this.sketch.setupParameters(v);
      });
    gui
      .add(settings, "binSize")
      .min(1)
      .max(10)
      .step(1)
      .onChange((v) => {
        this.sketch.setupFFT(Math.pow(2, 4 + v));
      });
    */
  }

  Sketch(p) {
    let canvas;
    let brandColor;
    let backgroundColor;

    let center = 0;
    let circleCenterRadius;
    let innerRadius;
    let outerRadius;

    let fadeIn = 0;
    let poissonWidth;
    let sizeX;

    let points;

    let fft;
    let spectrum;
    let spectrumAverages;
    let mic;

    let octaveBands;

    let song;

    p.switchToMic = () => {
      song.pause();
      if (song !== undefined) song.stop();
      mic = new p5.AudioIn();
      mic.start();
      fft.setInput(mic);
    };

    p.switchToSong = () => {
      if (mic !== undefined) mic.stop();
      song.play();
      fft.setInput(song);
    };

    p.stopAudio = () => {
      song.stop();
    };

    const stopSong = () => {
      song.stop();
    };

    const loadSong = (buffer) => {
      song = p.loadSound(buffer, soundReady, null, null);
    };

    const soundReady = () => {
      song.play();
    };

    const setupParameters = (radius = 15) => {
      circleCenterRadius = radius;
      poissonWidth = 30 * radius;
      innerRadius = radius;
      outerRadius = innerRadius * 10;
      let p = new PoissonDiskSampling({
        shape: [poissonWidth, poissonWidth],
        minDistance: innerRadius,
        maxDistance: outerRadius,
        tries: 3,
      });
      points = p.fill();
    };

    const setupFFT = (binSize = 32) => {
      // Analysis
      fft = new p5.FFT(0.0, binSize);
      fft.smooth(0.75);
      octaveBands = fft.getOctaveBands(1);
      fft.setInput(song);
    };

    p.preload = () => {
      song = p.loadSound("/assets/mp3/logo.exhibition.20201121.mp3");
    };

    p.setup = () => {
      console.log("Setup");
      p.frameRate(30);
      const wrapper = document.querySelector("#logo-canvas-wrapper");
      const size = wrapper.getBoundingClientRect();
      canvas = p.createCanvas(size.width, size.height);
      canvas.parent(wrapper);
      brandColor = p.color(50, 48, 69);
      backgroundColor = p.color(215, 128, 162);
      setupParameters(10);
      setupFFT(32);
    };

    p.draw = () => {
      // Fade in
      fadeIn = p.frameCount / 100;
      var dotColor = p.lerpColor(backgroundColor, brandColor, fadeIn);
      // Breathing
      let time = p.frameCount / 30.0;
      let breathe = 0.65 + (p.sin(time) * p.cos(time) + 1.0) / 3.0;
      let invBreathe =
        0.75 + (1.0 - (p.sin(time) * p.cos(time) + 1.0) / 2.0) * 10.0;

      // FFT
      spectrum = fft.analyze();
      spectrumAverages = fft.logAverages(octaveBands);
      var spectrumAveragesRev = spectrumAverages.slice().reverse();
      spectrumAverages = spectrumAverages.concat(spectrumAveragesRev);
      center = fft.getEnergy("bass");
      circleCenterRadius = p.map(
        p.pow(center, 2),
        0,
        255 * 255,
        innerRadius,
        innerRadius * 6
      );
      // Clear
      p.background(backgroundColor);
      //
      p.translate(p.width / 2, p.height / 2);
      var waveRadius = outerRadius;
      var radius = breathe * waveRadius;
      for (var pt = 0; pt < points.length; pt++) {
        var point = points[pt];
        var angle = p.atan2(
          point[1] - poissonWidth / 2,
          point[0] - poissonWidth / 2
        );
        let spectralIndex = Math.floor(
          ((((angle + time) % p.PI) + p.PI) / p.TWO_PI) *
            spectrumAverages.length
        );
        var amp = spectrumAverages[spectralIndex] / 512;
        var energy = waveRadius * amp;

        var distance = p.dist(
          poissonWidth / 2,
          poissonWidth / 2,
          point[0],
          point[1]
        );
        if (distance > innerRadius * 40 || distance < circleCenterRadius)
          continue;
        var wavePoint = [
          (radius + energy) * p.cos(angle),
          (radius + energy) * p.sin(angle),
        ];
        var distanceWavePoint = p.dist(0, 0, wavePoint[0], wavePoint[1]);
        var distancePointToWavePoint = p.dist(
          wavePoint[0],
          wavePoint[1],
          point[0] - poissonWidth / 2,
          point[1] - poissonWidth / 2
        );
        //// Poisson points
        p.noStroke();
        let circleRadius = p.map(
          0.5 - distancePointToWavePoint / waveRadius,
          0.3,
          0.5,
          0,
          innerRadius
        );
        p.fill(
          p.lerpColor(dotColor, backgroundColor, 255 - circleRadius * 255)
        );
        p.circle(
          point[0] - poissonWidth / 2,
          point[1] - poissonWidth / 2,
          circleRadius
        );
      }
      p.noStroke();
      p.fill(dotColor);
      p.circle(0, 0, invBreathe + circleCenterRadius);
    };

    p.windowResized = () => {
      const wrapper = document.querySelector("#logo-canvas-wrapper");
      const size = wrapper.getBoundingClientRect();
      p.resizeCanvas(size.width, size.height);
    };

    p.setupParameters = setupParameters;
    p.stopSong = stopSong;
    p.loadSong = loadSong;
    p.setupFFT = setupFFT;
  }

  componentDidMount() {
    console.log("Component Did Mount");
    if (this.props.entered === false) {
      return;
    }
    if (this.sketch === undefined) {
      this.sketch = new p5(this.Sketch, this.sketchRef.current);
    }
  }

  onFileUpload(e) {
    const fileReader = new FileReader();
    const lastFile = e.target.files[e.target.files.length - 1];
    fileReader.readAsDataURL(lastFile);
    this.sketch.stopSong();
    fileReader.addEventListener("load", () => {
      this.sketch.loadSong(fileReader.result);
    });
  }

  render() {
    return (
      <>
        <main className="logo-main">
          <div
            ref={this.sketchRef}
            id="logo-canvas-wrapper"
            data-song="mp3/foyer.20201025.mp3"
          ></div>
        </main>
        <nav className="ui">
          <button
            className={[
              "btn-song",
              this.state.selection === selectionType.SONG ? "active" : "",
            ]
              .join(" ")
              .trim()}
            onClick={() => {
              this.sketch.switchToSong();
              this.setState({ selection: selectionType.SONG });
            }}
          >
            <span className="emoji">🎵</span>
          </button>
          <button
            className={[
              "btn-mic",
              this.state.selection === selectionType.MIC ? "active" : "",
            ]
              .join(" ")
              .trim()}
            onClick={() => {
              this.sketch.switchToMic();
              this.setState({ selection: selectionType.MIC });
            }}
          >
            <span className="emoji">🎤</span>
          </button>
          <label
            htmlFor="upload"
            className={[
              "btn-file",
              this.state.selection === selectionType.FILE ? "active" : "",
            ]
              .join(" ")
              .trim()}
          >
            <span className="emoji">📁</span>
          </label>
          <input
            id="upload"
            type="file"
            onChange={(e) => {
              this.setState({ selection: selectionType.FILE });
              this.onFileUpload(e);
            }}
            style={{ display: "none" }}
          />
        </nav>
      </>
    );
  }
}

export default Dot;
