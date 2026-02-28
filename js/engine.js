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
  // Input Handling
  // ---------------------------------------------------------------------------

  var keys = {};

  window.addEventListener('keydown', function (e) {
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

    updatePlayer(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------

  window.addEventListener('resize', function () {
    resize();
  });

  resize();

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
