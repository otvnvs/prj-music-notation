//import { generateMeasure as gmDefault } from "./default.js";
//import { generateMeasure as gmVersion1 } from "./version1.js";
//import { generateMeasure as gmVersion2 } from "./version2.js";
//
//export {
//	gmDefault as generateMeasure/*,
//	gmVersion2 as generateMeasure1,
//	gmVersion3 as generateMeasure2,*/
//}
//--------------------------------------------------------------------------------
import { generateMeasure as gmDefault } from "./default.js";
import { generateMeasure as gmVersion1 } from "./version1.js";
import { generateMeasure as gmVersion2 } from "./version2.js";

/**
 * Generates a music measure using the specified generator version.
 * 
 * @param {Object} currentScore - The current score state.
 * @param {Object} [options={}] - Configuration options.
 * @param {string} [options.version='default'] - The generator version ('default', 'v1', or 'v2').
 */
export function generateMeasure(currentScore, options = {}) {
  // Extract configuration properties with defensive defaults
  const { version = 'default' } = options;

  // Map configuration strings directly to your imported functions
  switch (version) {
    case 'v1':
    case 'version1':
      return gmVersion1(currentScore, options);
    case 'v2':
    case 'version2':
      return gmVersion2(currentScore, options);
    case 'default':
    default:
      return gmDefault(currentScore, options);
  }
}

