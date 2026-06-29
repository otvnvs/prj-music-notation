export function createLine(x1, y1, x2, y2, stroke, width) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
}

export function createRect(x, y, width, height, fill, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" rx="${rx}"/>`;
}

export function createEllipse(cx, cy, rx, ry, fill, stroke, width, angle) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" transform="rotate(${angle} ${cx} ${cy})"/>`;
}

export function createCircle(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

export function createPolygon(points, fill) {
  return `<polygon points="${points}" fill="${fill}"/>`;
}

export function renderGlyph(x, y, glyphConfig, options = {}) {
  if (!glyphConfig || !glyphConfig.type) return '';

  const fill = options.fill || '#000000';
  const size = options.fontSize || 16;
  const anchor = options.anchor || 'start';
  const weight = options.weight || 'normal';
  const transform = options.transform || '';

  switch (glyphConfig.type) {
    case 'char':
      return `<text x="${x}" y="${y}" fill="${fill}" style="font-size:${size}px;font-family:serif;dominant-baseline:alphabetic;text-anchor:${anchor};font-weight:${weight};" ${transform ? `transform="${transform}"` : ''}>${glyphConfig.value}</text>`;
    
    case 'path':
      return `<path d="${glyphConfig.value}" fill="${fill}" transform="translate(${x}, ${y}) ${transform}" fill-rule="evenodd"/>`;
    
    case 'svg':
      return `<g transform="translate(${x}, ${y}) ${transform}">${glyphConfig.value}</g>`;
    
    default:
      return '';
  }
}

