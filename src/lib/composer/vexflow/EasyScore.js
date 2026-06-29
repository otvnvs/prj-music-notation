//export default class EasyScore {
//  constructor(factory) {
//    this.factory = factory;
//  }
//
//  notes(scoreString, options = {}) {
//    return scoreString.split(',').map(token => {
//      const [pitch, rawDuration] = token.trim().split('/');
//      const dToken = rawDuration || 'q';
//      
//      const isDotted = dToken.indexOf('.') !== -1 && dToken.indexOf('..') === -1;
//      const isDoubleDotted = dToken.indexOf('..') !== -1;
//      const duration = dToken.replace(/\./g, '');
//      
//      const isRest = pitch.toUpperCase().startsWith('R');
//      const match = !isRest ? pitch.match(/([A-G])(#|b)?(\d+)/) : null;
//
//      return {
//        p: pitch,
//        d: duration,
//        isRest,
//        isDotted,
//        isDoubleDotted,
//        s: options.stem || 'auto',
//        l: match ? match[1] : 'B',
//        a: match && match[2] ? match[2] : '',
//        o: match && match[3] ? parseInt(match[3], 10) : 4
//      };
//    });
//  }
//
//  voice(notes) {
//    return { t: 'V', n: notes };
//  }
//}
//--------------------------------------------------------------------------------
export default class EasyScore {
  constructor(factory) {
    this.factory = factory;
  }

  notes(scoreString, options = {}) {
    return scoreString.split(',').map(token => {
      const [pitch, rawDuration] = token.trim().split('/');
      const dToken = rawDuration || 'q';
      
      const isDotted = dToken.indexOf('.') !== -1 && dToken.indexOf('..') === -1;
      const isDoubleDotted = dToken.indexOf('..') !== -1;
      const duration = dToken.replace(/\./g, '');
      
      const isRest = pitch.toUpperCase().startsWith('R');
      
      // Safe conditional parsing guard
      const match = !isRest ? pitch.match(/([A-G])(#|b)?(\d+)/) : null;

      return {
        p: pitch,
        d: duration,
        isRest,
        isDotted,
        isDoubleDotted,
        s: options.stem || 'auto',
        // Fallback safely to middle line B4 values if token is marked as a musical rest
        l: isRest ? 'B' : (match ? match[1] : 'B'),
        a: !isRest && match && match[2] ? match[2] : '',
        o: isRest ? 4 : (match && match[3] ? parseInt(match[3], 10) : 4)
      };
    });
  }

  voice(notes) {
    return { t: 'V', n: notes };
  }
}



