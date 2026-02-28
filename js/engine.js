/**
 * Fun - Canvas Game Engine
 * A retro tile-based rendering engine with a greenish color palette.
 * Top-down Zelda-like view with pixelated aesthetic.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  var TILE_SIZE = 16;           // Base tile size in pixels
  var SCALE = 3;                // Scale factor for retro pixel look
  var DRAWN_TILE = TILE_SIZE * SCALE;  // Actual drawn size on screen

  // Greenish color palette -- multiple shades for visual variety
  var PALETTE = {
    // Grass tiles (most common)
    grass: [
      '#2d5a1e',  // dark green
      '#3b7a28',  // medium green
      '#4a8c34',  // standard green
      '#3e7230',  // muted green
      '#356b26',  // forest green
    ],
    // Path / dirt tiles
    path: [
      '#5a6a3a',  // olive
      '#4d5e30',  // dark olive
    ],
    // Flowers / decoration accents
    flowers: [
      '#6aaa3a',  // bright green
      '#7bc24a',  // lime accent
    ],
    // Water tiles
    water: [
      '#1a4a3a',  // dark teal
      '#1e5a48',  // teal
    ],
    // Tree / bush dark tiles
    trees: [
      '#1a3a12',  // very dark green
      '#1e4416',  // dark forest
    ],
  };

  // Tile type constants
  var TILE = {
    GRASS_1: 0,
    GRASS_2: 1,
    GRASS_3: 2,
    GRASS_4: 3,
    GRASS_5: 4,
    PATH_1: 5,
    PATH_2: 6,
    FLOWER_1: 7,
    FLOWER_2: 8,
    WATER_1: 9,
    WATER_2: 10,
    TREE_1: 11,
    TREE_2: 12,
  };

  // Map tile IDs to palette colors
  var TILE_COLORS = {};
  TILE_COLORS[TILE.GRASS_1] = PALETTE.grass[0];
  TILE_COLORS[TILE.GRASS_2] = PALETTE.grass[1];
  TILE_COLORS[TILE.GRASS_3] = PALETTE.grass[2];
  TILE_COLORS[TILE.GRASS_4] = PALETTE.grass[3];
  TILE_COLORS[TILE.GRASS_5] = PALETTE.grass[4];
  TILE_COLORS[TILE.PATH_1] = PALETTE.path[0];
  TILE_COLORS[TILE.PATH_2] = PALETTE.path[1];
  TILE_COLORS[TILE.FLOWER_1] = PALETTE.flowers[0];
  TILE_COLORS[TILE.FLOWER_2] = PALETTE.flowers[1];
  TILE_COLORS[TILE.WATER_1] = PALETTE.water[0];
  TILE_COLORS[TILE.WATER_2] = PALETTE.water[1];
  TILE_COLORS[TILE.TREE_1] = PALETTE.trees[0];
  TILE_COLORS[TILE.TREE_2] = PALETTE.trees[1];

  // ---------------------------------------------------------------------------
  // Tile Map Generation
  // ---------------------------------------------------------------------------

  /**
   * Seeded pseudo-random number generator for deterministic maps.
   */
  function seededRandom(seed) {
    var s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /**
   * Generate a tile map that fills the viewport.
   * Creates a natural-looking top-down world with grass, paths, water, and trees.
   */
  function generateTileMap(cols, rows) {
    var rng = seededRandom(42);
    var map = [];

    for (var y = 0; y < rows; y++) {
      var row = [];
      for (var x = 0; x < cols; x++) {
        var val = rng();
        var tile;

        // Base layer: mostly grass with variation
        if (val < 0.25) {
          tile = TILE.GRASS_1;
        } else if (val < 0.45) {
          tile = TILE.GRASS_2;
        } else if (val < 0.60) {
          tile = TILE.GRASS_3;
        } else if (val < 0.72) {
          tile = TILE.GRASS_4;
        } else if (val < 0.82) {
          tile = TILE.GRASS_5;
        } else if (val < 0.87) {
          tile = TILE.FLOWER_1;
        } else if (val < 0.90) {
          tile = TILE.FLOWER_2;
        } else if (val < 0.94) {
          tile = TILE.TREE_1;
        } else if (val < 0.97) {
          tile = TILE.TREE_2;
        } else {
          tile = TILE.WATER_1;
        }

        row.push(tile);
      }
      map.push(row);
    }

    // Carve a winding path through the map
    var pathY = Math.floor(rows / 2);
    for (var px = 0; px < cols; px++) {
      map[pathY][px] = (px % 3 === 0) ? TILE.PATH_2 : TILE.PATH_1;
      // Slight wander
      if (rng() < 0.3 && pathY > 2) pathY--;
      if (rng() < 0.3 && pathY < rows - 3) pathY++;
      // Widen the path a little
      if (pathY > 0) map[pathY - 1][px] = TILE.PATH_1;
      if (pathY < rows - 1) map[pathY + 1][px] = TILE.PATH_1;
    }

    // Add a small pond
    var pondX = Math.floor(cols * 0.7);
    var pondY = Math.floor(rows * 0.3);
    for (var py = pondY - 1; py <= pondY + 1; py++) {
      for (var ppx = pondX - 2; ppx <= pondX + 2; ppx++) {
        if (py >= 0 && py < rows && ppx >= 0 && ppx < cols) {
          map[py][ppx] = (py === pondY && ppx === pondX) ? TILE.WATER_2 : TILE.WATER_1;
        }
      }
    }

    return map;
  }

  // ---------------------------------------------------------------------------
  // Tile Renderer -- draws pixel-art detail on each tile
  // ---------------------------------------------------------------------------

  /**
   * Draw a single tile with retro pixel-art detail.
   */
  function drawTile(ctx, tileId, screenX, screenY) {
    var baseColor = TILE_COLORS[tileId] || PALETTE.grass[0];

    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(screenX, screenY, DRAWN_TILE, DRAWN_TILE);

    // Add pixel-art detail depending on tile type
    var px = SCALE; // one "pixel" in our retro grid

    if (tileId <= TILE.GRASS_5) {
      // Grass: scatter a few darker/lighter pixels for texture
      ctx.fillStyle = shadeColor(baseColor, -15);
      ctx.fillRect(screenX + 3 * px, screenY + 2 * px, px, px);
      ctx.fillRect(screenX + 7 * px, screenY + 9 * px, px, px);
      ctx.fillRect(screenX + 12 * px, screenY + 5 * px, px, px);
      ctx.fillStyle = shadeColor(baseColor, 15);
      ctx.fillRect(screenX + 5 * px, screenY + 11 * px, px, px);
      ctx.fillRect(screenX + 10 * px, screenY + 3 * px, px, px);
    } else if (tileId === TILE.PATH_1 || tileId === TILE.PATH_2) {
      // Path: pebble texture
      ctx.fillStyle = shadeColor(baseColor, 10);
      ctx.fillRect(screenX + 4 * px, screenY + 4 * px, 2 * px, px);
      ctx.fillRect(screenX + 10 * px, screenY + 8 * px, 2 * px, px);
      ctx.fillStyle = shadeColor(baseColor, -10);
      ctx.fillRect(screenX + 7 * px, screenY + 12 * px, px, px);
    } else if (tileId === TILE.FLOWER_1 || tileId === TILE.FLOWER_2) {
      // Flower on grass
      ctx.fillStyle = '#e8d44a'; // yellow petal
      ctx.fillRect(screenX + 7 * px, screenY + 6 * px, 2 * px, 2 * px);
      ctx.fillStyle = '#d45a2a'; // red center
      ctx.fillRect(screenX + 7 * px, screenY + 7 * px, px, px);
    } else if (tileId === TILE.WATER_1 || tileId === TILE.WATER_2) {
      // Water: wave highlights
      ctx.fillStyle = shadeColor(baseColor, 20);
      ctx.fillRect(screenX + 2 * px, screenY + 5 * px, 3 * px, px);
      ctx.fillRect(screenX + 8 * px, screenY + 10 * px, 4 * px, px);
      ctx.fillStyle = shadeColor(baseColor, -10);
      ctx.fillRect(screenX + 5 * px, screenY + 3 * px, 2 * px, px);
    } else if (tileId === TILE.TREE_1 || tileId === TILE.TREE_2) {
      // Tree: trunk + canopy
      ctx.fillStyle = '#3a2a1a'; // brown trunk
      ctx.fillRect(screenX + 7 * px, screenY + 10 * px, 2 * px, 5 * px);
      ctx.fillStyle = '#1a5a12'; // canopy
      ctx.fillRect(screenX + 4 * px, screenY + 3 * px, 8 * px, 8 * px);
      ctx.fillStyle = shadeColor(baseColor, 15);
      ctx.fillRect(screenX + 5 * px, screenY + 4 * px, 3 * px, 3 * px);
    }

    // Subtle grid line for tile borders (very faint)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(screenX + DRAWN_TILE - 1, screenY, 1, DRAWN_TILE);
    ctx.fillRect(screenX, screenY + DRAWN_TILE - 1, DRAWN_TILE, 1);
  }

  /**
   * Lighten or darken a hex color by a percentage amount.
   */
  function shadeColor(color, percent) {
    var num = parseInt(color.replace('#', ''), 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + percent));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    var b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ---------------------------------------------------------------------------
  // Collision Helpers
  // ---------------------------------------------------------------------------

  /**
   * Check if a tile is solid (cannot walk on it).
   */
  function isSolidTile(tileId) {
    return tileId === TILE.WATER_1 || tileId === TILE.WATER_2 ||
           tileId === TILE.TREE_1  || tileId === TILE.TREE_2;
  }

  // ---------------------------------------------------------------------------
  // Player Character
  // ---------------------------------------------------------------------------

  var DIR = { DOWN: 0, UP: 1, LEFT: 2, RIGHT: 3 };

  var player = {
    tileX: 2,             // current tile position
    tileY: 2,
    screenX: 2 * DRAWN_TILE,  // pixel position for smooth movement
    screenY: 2 * DRAWN_TILE,
    targetX: 2 * DRAWN_TILE,  // target pixel position when moving
    targetY: 2 * DRAWN_TILE,
    moving: false,
    direction: DIR.DOWN,
    walkFrame: 0,         // 0 or 1 for walk cycle
    walkTimer: 0,         // accumulator for walk animation
    moveSpeed: 4 * SCALE, // pixels per frame to move (smooth slide)
  };

  /**
   * Find a valid (non-solid) spawn position for the player near the center.
   */
  function findSpawnPosition() {
    var cx = Math.floor(mapCols / 2);
    var cy = Math.floor(mapRows / 2);
    // Spiral outward from center to find walkable tile
    for (var r = 0; r < Math.max(mapCols, mapRows); r++) {
      for (var dy = -r; dy <= r; dy++) {
        for (var dx = -r; dx <= r; dx++) {
          var tx = cx + dx;
          var ty = cy + dy;
          if (tx >= 0 && tx < mapCols && ty >= 0 && ty < mapRows) {
            if (!isSolidTile(tileMap[ty][tx])) {
              return { x: tx, y: ty };
            }
          }
        }
      }
    }
    return { x: 0, y: 0 };
  }

  // ---------------------------------------------------------------------------
  // Player Sprite Renderer (pixel art with canvas primitives)
  // ---------------------------------------------------------------------------

  /**
   * Draw the player character at a given screen position.
   * A little retro adventurer with a green hat and tunic.
   */
  function drawPlayer(ctx, sx, sy, direction, walkFrame) {
    var px = SCALE; // one retro pixel

    // Shadow under character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(sx + 4 * px, sy + 14 * px, 8 * px, 2 * px);

    // --- Body / Tunic ---
    ctx.fillStyle = '#4a8a3a'; // green tunic
    ctx.fillRect(sx + 5 * px, sy + 8 * px, 6 * px, 5 * px);

    // --- Skin (face/arms) ---
    ctx.fillStyle = '#e8c89a'; // skin tone
    // Head
    ctx.fillRect(sx + 5 * px, sy + 4 * px, 6 * px, 4 * px);

    // Arms vary with walk frame
    if (walkFrame === 0) {
      ctx.fillRect(sx + 3 * px, sy + 9 * px, 2 * px, 3 * px); // left arm
      ctx.fillRect(sx + 11 * px, sy + 9 * px, 2 * px, 3 * px); // right arm
    } else {
      ctx.fillRect(sx + 3 * px, sy + 8 * px, 2 * px, 3 * px); // left arm up
      ctx.fillRect(sx + 11 * px, sy + 10 * px, 2 * px, 3 * px); // right arm down
    }

    // --- Hat ---
    ctx.fillStyle = '#2a6a1a'; // dark green hat
    ctx.fillRect(sx + 4 * px, sy + 2 * px, 8 * px, 3 * px);
    ctx.fillRect(sx + 5 * px, sy + 1 * px, 6 * px, 1 * px);

    // Hat brim highlight
    ctx.fillStyle = '#3a7a2a';
    ctx.fillRect(sx + 5 * px, sy + 4 * px, 6 * px, 1 * px);

    // --- Eyes ---
    ctx.fillStyle = '#1a1a2a'; // dark eyes
    if (direction === DIR.DOWN) {
      ctx.fillRect(sx + 6 * px, sy + 5 * px, px, px);
      ctx.fillRect(sx + 9 * px, sy + 5 * px, px, px);
    } else if (direction === DIR.UP) {
      // No eyes visible from back
      ctx.fillStyle = '#c8a87a'; // hair color from back
      ctx.fillRect(sx + 5 * px, sy + 4 * px, 6 * px, 2 * px);
    } else if (direction === DIR.LEFT) {
      ctx.fillRect(sx + 5 * px, sy + 5 * px, px, px);
    } else if (direction === DIR.RIGHT) {
      ctx.fillRect(sx + 10 * px, sy + 5 * px, px, px);
    }

    // --- Legs / Boots ---
    ctx.fillStyle = '#5a4a2a'; // brown boots
    if (walkFrame === 0) {
      ctx.fillRect(sx + 5 * px, sy + 13 * px, 2 * px, 2 * px); // left boot
      ctx.fillRect(sx + 9 * px, sy + 13 * px, 2 * px, 2 * px); // right boot
    } else {
      // Walking animation: legs apart
      ctx.fillRect(sx + 4 * px, sy + 13 * px, 2 * px, 2 * px); // left boot forward
      ctx.fillRect(sx + 10 * px, sy + 12 * px, 2 * px, 2 * px); // right boot back
    }

    // --- Belt ---
    ctx.fillStyle = '#7a6a3a';
    ctx.fillRect(sx + 5 * px, sy + 12 * px, 6 * px, px);

    // Belt buckle
    ctx.fillStyle = '#e8d44a';
    ctx.fillRect(sx + 7 * px, sy + 12 * px, 2 * px, px);
  }

  // ---------------------------------------------------------------------------
  // Game State
  // ---------------------------------------------------------------------------

  var STATE = { TITLE: 0, TRANSITION: 1, PLAYING: 2 };
  var gameState = STATE.TITLE;
  var titleAlpha = 1;          // Used for fade-out transition
  var transitionTimer = 0;
  var TRANSITION_DURATION = 1200; // ms for fade-out

  // Title screen animation state
  var titleTime = 0;           // Accumulated time for animations
  var titleStars = [];         // Decorative background stars

  /**
   * Generate decorative stars for the title screen background.
   */
  function generateTitleStars(count) {
    var stars = [];
    var rng = seededRandom(1337);
    for (var i = 0; i < count; i++) {
      stars.push({
        x: rng(),
        y: rng(),
        size: Math.floor(rng() * 3) + 1,
        speed: rng() * 0.5 + 0.2,
        brightness: rng(),
      });
    }
    return stars;
  }

  // ---------------------------------------------------------------------------
  // Title Screen Renderer
  // ---------------------------------------------------------------------------

  /**
   * Draw a pixel-art border frame on the canvas.
   */
  function drawRetroBorder(ctx, w, h, time) {
    var borderWidth = 6;
    var cornerSize = 18;
    var pulse = Math.sin(time * 0.002) * 0.15 + 0.85;

    // Outer border glow
    ctx.fillStyle = 'rgba(74, 140, 52, ' + (0.4 * pulse) + ')';
    ctx.fillRect(0, 0, w, borderWidth);
    ctx.fillRect(0, h - borderWidth, w, borderWidth);
    ctx.fillRect(0, 0, borderWidth, h);
    ctx.fillRect(w - borderWidth, 0, borderWidth, h);

    // Inner border line
    ctx.fillStyle = 'rgba(106, 170, 58, ' + (0.7 * pulse) + ')';
    ctx.fillRect(borderWidth, borderWidth, w - 2 * borderWidth, 2);
    ctx.fillRect(borderWidth, h - borderWidth - 2, w - 2 * borderWidth, 2);
    ctx.fillRect(borderWidth, borderWidth, 2, h - 2 * borderWidth);
    ctx.fillRect(w - borderWidth - 2, borderWidth, 2, h - 2 * borderWidth);

    // Corner decorations
    var cornerColor = 'rgba(123, 194, 74, ' + (0.8 * pulse) + ')';
    ctx.fillStyle = cornerColor;
    // Top-left
    ctx.fillRect(borderWidth, borderWidth, cornerSize, 3);
    ctx.fillRect(borderWidth, borderWidth, 3, cornerSize);
    // Top-right
    ctx.fillRect(w - borderWidth - cornerSize, borderWidth, cornerSize, 3);
    ctx.fillRect(w - borderWidth - 3, borderWidth, 3, cornerSize);
    // Bottom-left
    ctx.fillRect(borderWidth, h - borderWidth - 3, cornerSize, 3);
    ctx.fillRect(borderWidth, h - borderWidth - cornerSize, 3, cornerSize);
    // Bottom-right
    ctx.fillRect(w - borderWidth - cornerSize, h - borderWidth - 3, cornerSize, 3);
    ctx.fillRect(w - borderWidth - 3, h - borderWidth - cornerSize, 3, cornerSize);
  }

  /**
   * Draw twinkling stars on the title screen.
   */
  function drawTitleStars(ctx, stars, w, h, time) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = Math.sin(time * 0.003 * s.speed + s.brightness * 6.28) * 0.5 + 0.5;
      var alpha = twinkle * 0.7 + 0.1;
      var green = Math.floor(120 + twinkle * 80);
      ctx.fillStyle = 'rgba(' + Math.floor(80 + twinkle * 40) + ', ' + green + ', ' + Math.floor(60 + twinkle * 30) + ', ' + alpha + ')';
      var sx = s.x * w;
      var sy = s.y * h;
      var sz = s.size;
      // Draw cross-shaped star
      ctx.fillRect(sx, sy - sz, sz, sz * 3);
      ctx.fillRect(sx - sz, sy, sz * 3, sz);
    }
  }

  /**
   * Draw pixel-art text character by character (blocky retro style).
   * Each character is drawn on a 5x7 pixel grid, scaled up.
   */
  var PIXEL_FONT = {
    'A': [0x7C,0x12,0x11,0x12,0x7C],
    'B': [0x7F,0x49,0x49,0x49,0x36],
    'C': [0x3E,0x41,0x41,0x41,0x22],
    'D': [0x7F,0x41,0x41,0x22,0x1C],
    'E': [0x7F,0x49,0x49,0x49,0x41],
    'F': [0x7F,0x09,0x09,0x09,0x01],
    'G': [0x3E,0x41,0x49,0x49,0x7A],
    'H': [0x7F,0x08,0x08,0x08,0x7F],
    'I': [0x00,0x41,0x7F,0x41,0x00],
    'J': [0x20,0x40,0x41,0x3F,0x01],
    'K': [0x7F,0x08,0x14,0x22,0x41],
    'L': [0x7F,0x40,0x40,0x40,0x40],
    'M': [0x7F,0x02,0x0C,0x02,0x7F],
    'N': [0x7F,0x04,0x08,0x10,0x7F],
    'O': [0x3E,0x41,0x41,0x41,0x3E],
    'P': [0x7F,0x09,0x09,0x09,0x06],
    'Q': [0x3E,0x41,0x51,0x21,0x5E],
    'R': [0x7F,0x09,0x19,0x29,0x46],
    'S': [0x46,0x49,0x49,0x49,0x31],
    'T': [0x01,0x01,0x7F,0x01,0x01],
    'U': [0x3F,0x40,0x40,0x40,0x3F],
    'V': [0x1F,0x20,0x40,0x20,0x1F],
    'W': [0x3F,0x40,0x38,0x40,0x3F],
    'X': [0x63,0x14,0x08,0x14,0x63],
    'Y': [0x07,0x08,0x70,0x08,0x07],
    'Z': [0x61,0x51,0x49,0x45,0x43],
    '0': [0x3E,0x51,0x49,0x45,0x3E],
    '1': [0x00,0x42,0x7F,0x40,0x00],
    '2': [0x42,0x61,0x51,0x49,0x46],
    '3': [0x22,0x41,0x49,0x49,0x36],
    '4': [0x18,0x14,0x12,0x7F,0x10],
    '5': [0x27,0x45,0x45,0x45,0x39],
    '6': [0x3C,0x4A,0x49,0x49,0x30],
    '7': [0x01,0x71,0x09,0x05,0x03],
    '8': [0x36,0x49,0x49,0x49,0x36],
    '9': [0x06,0x49,0x49,0x29,0x1E],
    ' ': [0x00,0x00,0x00,0x00,0x00],
    '.': [0x00,0x60,0x60,0x00,0x00],
    '!': [0x00,0x00,0x5F,0x00,0x00],
    '?': [0x02,0x01,0x51,0x09,0x06],
    '-': [0x08,0x08,0x08,0x08,0x08],
    ':': [0x00,0x36,0x36,0x00,0x00],
    ',': [0x00,0x80,0x60,0x00,0x00],
  };

  /**
   * Draw a string using the pixel font. Returns total width drawn.
   * charScale is how many screen pixels per font pixel.
   */
  function drawPixelText(ctx, text, x, y, charScale, color) {
    var charWidth = 5;
    var charHeight = 7;
    var spacing = 1; // pixels between chars
    var totalWidth = 0;

    ctx.fillStyle = color;

    for (var c = 0; c < text.length; c++) {
      var ch = text.charAt(c).toUpperCase();
      var glyph = PIXEL_FONT[ch];
      if (!glyph) glyph = PIXEL_FONT[' '];

      for (var col = 0; col < charWidth; col++) {
        var bits = glyph[col];
        for (var row = 0; row < charHeight; row++) {
          if (bits & (1 << row)) {
            ctx.fillRect(
              x + (c * (charWidth + spacing) + col) * charScale,
              y + row * charScale,
              charScale,
              charScale
            );
          }
        }
      }
      totalWidth += (charWidth + spacing) * charScale;
    }
    return totalWidth;
  }

  /**
   * Measure the width of a string in pixel font units.
   */
  function measurePixelText(text, charScale) {
    var charWidth = 5;
    var spacing = 1;
    return text.length * (charWidth + spacing) * charScale;
  }

  /**
   * Draw a decorative sword/shield emblem below the title.
   */
  function drawEmblem(ctx, cx, cy, scale, time) {
    var px = scale;
    var glow = Math.sin(time * 0.003) * 0.2 + 0.8;

    // Shield shape
    ctx.fillStyle = 'rgba(42, 106, 26, ' + glow + ')';
    ctx.fillRect(cx - 5 * px, cy - 6 * px, 10 * px, 10 * px);
    ctx.fillRect(cx - 4 * px, cy + 4 * px, 8 * px, 2 * px);
    ctx.fillRect(cx - 3 * px, cy + 6 * px, 6 * px, 2 * px);
    ctx.fillRect(cx - 1 * px, cy + 8 * px, 2 * px, 2 * px);

    // Shield inner
    ctx.fillStyle = 'rgba(74, 138, 58, ' + glow + ')';
    ctx.fillRect(cx - 3 * px, cy - 4 * px, 6 * px, 7 * px);

    // Shield cross emblem
    ctx.fillStyle = 'rgba(232, 212, 74, ' + glow + ')';
    ctx.fillRect(cx - px, cy - 4 * px, 2 * px, 7 * px);
    ctx.fillRect(cx - 3 * px, cy - 1 * px, 6 * px, 2 * px);

    // Sword left
    ctx.fillStyle = 'rgba(180, 180, 200, ' + glow + ')';
    ctx.fillRect(cx - 10 * px, cy - 10 * px, px, 14 * px); // blade
    ctx.fillStyle = 'rgba(120, 90, 40, ' + glow + ')';
    ctx.fillRect(cx - 12 * px, cy + 3 * px, 5 * px, px); // guard
    ctx.fillStyle = 'rgba(100, 70, 30, ' + glow + ')';
    ctx.fillRect(cx - 10 * px, cy + 4 * px, px, 3 * px); // grip

    // Sword right (mirrored)
    ctx.fillStyle = 'rgba(180, 180, 200, ' + glow + ')';
    ctx.fillRect(cx + 9 * px, cy - 10 * px, px, 14 * px);
    ctx.fillStyle = 'rgba(120, 90, 40, ' + glow + ')';
    ctx.fillRect(cx + 7 * px, cy + 3 * px, 5 * px, px);
    ctx.fillStyle = 'rgba(100, 70, 30, ' + glow + ')';
    ctx.fillRect(cx + 9 * px, cy + 4 * px, px, 3 * px);
  }

  /**
   * Render the title screen.
   */
  function renderTitleScreen(time) {
    var w = canvas.width;
    var h = canvas.height;

    // Dark background with subtle gradient feel
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, w, h);

    // Draw twinkling stars
    drawTitleStars(ctx, titleStars, w, h, time);

    // Draw retro border
    drawRetroBorder(ctx, w, h, time);

    // Calculate title text scale based on canvas size
    var titleScale = Math.max(3, Math.floor(Math.min(w, h) / 140));
    var titleText = 'Welcome to the Realm';
    var titleWidth = measurePixelText(titleText, titleScale);
    var titleX = Math.floor((w - titleWidth) / 2);
    var titleY = Math.floor(h * 0.28);

    // Title shadow
    drawPixelText(ctx, titleText, titleX + titleScale, titleY + titleScale, titleScale, 'rgba(0, 0, 0, 0.5)');

    // Title glow effect
    var glowPulse = Math.sin(time * 0.002) * 0.15 + 0.85;
    var glowG = Math.floor(180 * glowPulse + 40);
    var glowColor = 'rgb(' + Math.floor(glowG * 0.6) + ', ' + glowG + ', ' + Math.floor(glowG * 0.3) + ')';
    drawPixelText(ctx, titleText, titleX, titleY, titleScale, glowColor);

    // Bright highlight on top
    var hiG = Math.floor(220 * glowPulse + 35);
    drawPixelText(ctx, titleText, titleX, titleY - Math.floor(titleScale * 0.3), titleScale, 'rgba(' + Math.floor(hiG * 0.7) + ', ' + hiG + ', ' + Math.floor(hiG * 0.4) + ', 0.3)');

    // Draw decorative emblem
    var emblemScale = Math.max(2, Math.floor(titleScale * 0.8));
    drawEmblem(ctx, Math.floor(w / 2), Math.floor(h * 0.50), emblemScale, time);

    // "Press any key to begin" - flashing
    var promptScale = Math.max(2, Math.floor(titleScale * 0.5));
    var promptText = 'Press any key to begin';
    var promptWidth = measurePixelText(promptText, promptScale);
    var promptX = Math.floor((w - promptWidth) / 2);
    var promptY = Math.floor(h * 0.72);

    // Flash: visible for ~60% of a 1.2s cycle
    var flashCycle = (time % 1200) / 1200;
    if (flashCycle < 0.6) {
      var promptAlpha = Math.sin(flashCycle / 0.6 * Math.PI) * 0.6 + 0.4;
      drawPixelText(ctx, promptText, promptX, promptY, promptScale,
        'rgba(180, 210, 140, ' + promptAlpha + ')');
    }

    // Small credits line
    var creditScale = Math.max(1, Math.floor(promptScale * 0.7));
    var creditText = 'a retro adventure';
    var creditWidth = measurePixelText(creditText, creditScale);
    var creditX = Math.floor((w - creditWidth) / 2);
    var creditY = Math.floor(h * 0.85);
    drawPixelText(ctx, creditText, creditX, creditY, creditScale, 'rgba(100, 140, 80, 0.5)');
  }

  /**
   * Render the transition overlay (fading out title).
   */
  function renderTransitionOverlay() {
    if (titleAlpha > 0) {
      ctx.fillStyle = 'rgba(10, 26, 10, ' + titleAlpha + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ---------------------------------------------------------------------------
  // Input Handling
  // ---------------------------------------------------------------------------

  var keys = {};

  window.addEventListener('keydown', function (e) {
    // Title screen: any key starts the game
    if (gameState === STATE.TITLE) {
      gameState = STATE.TRANSITION;
      transitionTimer = 0;
      titleAlpha = 1;
      e.preventDefault();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1) {
      e.preventDefault();
      keys[e.key] = true;
    }
  });

  window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
  });

  // ---------------------------------------------------------------------------
  // Player Movement Logic
  // ---------------------------------------------------------------------------

  var MOVE_COOLDOWN = 140; // ms between tile moves when holding key
  var moveCooldownTimer = 0;

  /**
   * Try to move the player in a direction. Returns true if movement started.
   */
  function tryMove(dx, dy, dir) {
    player.direction = dir;
    var newTX = player.tileX + dx;
    var newTY = player.tileY + dy;

    // Boundary check
    if (newTX < 0 || newTX >= mapCols || newTY < 0 || newTY >= mapRows) {
      return false;
    }

    // Collision check
    if (isSolidTile(tileMap[newTY][newTX])) {
      return false;
    }

    // Start movement
    player.tileX = newTX;
    player.tileY = newTY;
    player.targetX = newTX * DRAWN_TILE;
    player.targetY = newTY * DRAWN_TILE;
    player.moving = true;
    player.walkFrame = 1 - player.walkFrame; // toggle walk cycle
    return true;
  }

  /**
   * Update player state each frame.
   */
  function updatePlayer(dt) {
    // If currently sliding to target, continue interpolation
    if (player.moving) {
      var dx = player.targetX - player.screenX;
      var dy = player.targetY - player.screenY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= player.moveSpeed) {
        // Snap to target
        player.screenX = player.targetX;
        player.screenY = player.targetY;
        player.moving = false;
      } else {
        // Slide toward target
        player.screenX += (dx / dist) * player.moveSpeed;
        player.screenY += (dy / dist) * player.moveSpeed;
      }
      return;
    }

    // Handle input when not currently sliding
    moveCooldownTimer -= dt;
    if (moveCooldownTimer > 0) return;

    var moved = false;
    if (keys['ArrowUp']) {
      moved = tryMove(0, -1, DIR.UP);
    } else if (keys['ArrowDown']) {
      moved = tryMove(0, 1, DIR.DOWN);
    } else if (keys['ArrowLeft']) {
      moved = tryMove(-1, 0, DIR.LEFT);
    } else if (keys['ArrowRight']) {
      moved = tryMove(1, 0, DIR.RIGHT);
    }

    if (moved) {
      moveCooldownTimer = MOVE_COOLDOWN;
    }
  }

  // ---------------------------------------------------------------------------
  // Engine Core
  // ---------------------------------------------------------------------------

  var canvas = document.getElementById('gameCanvas');
  var ctx = canvas.getContext('2d');

  // Disable anti-aliasing for crisp pixel art
  function disableSmoothing() {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
  }

  /**
   * Resize canvas to fill the viewport and regenerate the map.
   */
  var tileMap = [];
  var mapCols = 0;
  var mapRows = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    disableSmoothing();

    mapCols = Math.ceil(canvas.width / DRAWN_TILE) + 1;
    mapRows = Math.ceil(canvas.height / DRAWN_TILE) + 1;
    tileMap = generateTileMap(mapCols, mapRows);

    // Re-place player if needed (ensure they stay in bounds)
    if (player.tileX >= mapCols || player.tileY >= mapRows) {
      var spawn = findSpawnPosition();
      player.tileX = spawn.x;
      player.tileY = spawn.y;
    }
    // Ensure player is not on a solid tile after resize
    if (isSolidTile(tileMap[player.tileY][player.tileX])) {
      var spawn = findSpawnPosition();
      player.tileX = spawn.x;
      player.tileY = spawn.y;
    }
    player.screenX = player.tileX * DRAWN_TILE;
    player.screenY = player.tileY * DRAWN_TILE;
    player.targetX = player.screenX;
    player.targetY = player.screenY;
    player.moving = false;
  }

  /**
   * Render the full tile map and player to the canvas.
   */
  function render() {
    // Clear
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (var y = 0; y < mapRows; y++) {
      for (var x = 0; x < mapCols; x++) {
        drawTile(ctx, tileMap[y][x], x * DRAWN_TILE, y * DRAWN_TILE);
      }
    }

    // Draw player on top
    drawPlayer(ctx, player.screenX, player.screenY, player.direction, player.walkFrame);
  }

  // ---------------------------------------------------------------------------
  // Game Loop
  // ---------------------------------------------------------------------------

  var lastTime = 0;

  function gameLoop(timestamp) {
    var dt = timestamp - lastTime;
    lastTime = timestamp;

    // Clamp delta to avoid huge jumps (e.g. tab was backgrounded)
    if (dt > 100) dt = 16;

    titleTime += dt;

    if (gameState === STATE.TITLE) {
      renderTitleScreen(titleTime);
    } else if (gameState === STATE.TRANSITION) {
      transitionTimer += dt;
      var progress = Math.min(transitionTimer / TRANSITION_DURATION, 1);

      // Render the game world underneath
      updatePlayer(dt);
      render();

      // Fade overlay from opaque to transparent
      titleAlpha = 1 - progress;
      renderTransitionOverlay();

      if (progress >= 1) {
        gameState = STATE.PLAYING;
        titleAlpha = 0;
      }
    } else {
      updatePlayer(dt);
      render();
    }

    requestAnimationFrame(gameLoop);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  window.addEventListener('resize', function () {
    resize();
  });

  resize();

  // Initialize title screen stars
  titleStars = generateTitleStars(80);

  // Place player at a valid spawn point
  var spawn = findSpawnPosition();
  player.tileX = spawn.x;
  player.tileY = spawn.y;
  player.screenX = spawn.x * DRAWN_TILE;
  player.screenY = spawn.y * DRAWN_TILE;
  player.targetX = player.screenX;
  player.targetY = player.screenY;

  // Start the game loop
  requestAnimationFrame(function (timestamp) {
    lastTime = timestamp;
    gameLoop(timestamp);
  });
})();
