export default class System {
  constructor(factory) {
    this.factory = factory;
    this.staves = [];
    this.clefType = 'treble';
  }

  addStave(config) {
    this.staves.push({ voices: config.voices || [] });
    return this;
  }

  addClef(clefType) {
    this.clefType = clefType;
    return this;
  }

  addTimeSignature() {
    return this;
  }
}

