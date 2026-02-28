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
    // Fantasy themed tiles
    castle: [
      '#4a4a50',  // stone gray
      '#3a3a42',  // dark stone
      '#5a5a62',  // light stone
    ],
    ruins: [
      '#5a5a4a',  // weathered stone
      '#4a4a3a',  // mossy ruins
    ],
    // Sci-fi themed tiles
    techPanel: [
      '#2a2a3a',  // dark metal
      '#3a3a4a',  // medium metal
    ],
    energyTile: [
      '#1a2a4a',  // deep blue energy
      '#2a1a3a',  // deep purple energy
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
    // Fantasy themed tiles
    CASTLE_WALL: 13,
    CASTLE_FLOOR: 14,
    RUINS_1: 15,
    RUINS_2: 16,
    // Sci-fi themed tiles
    TECH_PANEL_1: 17,
    TECH_PANEL_2: 18,
    ENERGY_BLUE: 19,
    ENERGY_PURPLE: 20,
    METAL_FLOOR: 21,
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
  // Fantasy themed
  TILE_COLORS[TILE.CASTLE_WALL] = PALETTE.castle[0];
  TILE_COLORS[TILE.CASTLE_FLOOR] = PALETTE.castle[2];
  TILE_COLORS[TILE.RUINS_1] = PALETTE.ruins[0];
  TILE_COLORS[TILE.RUINS_2] = PALETTE.ruins[1];
  // Sci-fi themed
  TILE_COLORS[TILE.TECH_PANEL_1] = PALETTE.techPanel[0];
  TILE_COLORS[TILE.TECH_PANEL_2] = PALETTE.techPanel[1];
  TILE_COLORS[TILE.ENERGY_BLUE] = PALETTE.energyTile[0];
  TILE_COLORS[TILE.ENERGY_PURPLE] = PALETTE.energyTile[1];
  TILE_COLORS[TILE.METAL_FLOOR] = '#3a3a3a';

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

    // --- Fantasy Zone: Castle ruins (upper-left quadrant) ---
    var castleX = Math.floor(cols * 0.15);
    var castleY = Math.floor(rows * 0.2);
    var castleW = Math.min(7, cols - castleX - 1);
    var castleH = Math.min(6, rows - castleY - 1);
    if (castleX > 0 && castleY > 0) {
      // Lay castle floor
      for (var cy = castleY; cy < castleY + castleH && cy < rows; cy++) {
        for (var cx = castleX; cx < castleX + castleW && cx < cols; cx++) {
          map[cy][cx] = TILE.CASTLE_FLOOR;
        }
      }
      // Castle walls (borders of the rectangle, with a gap for doorway)
      for (var cx = castleX; cx < castleX + castleW && cx < cols; cx++) {
        if (castleY >= 0 && castleY < rows) map[castleY][cx] = TILE.CASTLE_WALL;
        var bottomY = castleY + castleH - 1;
        if (bottomY >= 0 && bottomY < rows) {
          // Leave a gap in bottom wall for doorway
          if (cx !== castleX + Math.floor(castleW / 2)) {
            map[bottomY][cx] = TILE.CASTLE_WALL;
          }
        }
      }
      for (var cy = castleY; cy < castleY + castleH && cy < rows; cy++) {
        if (castleX >= 0 && castleX < cols) map[cy][castleX] = TILE.CASTLE_WALL;
        var rightX = castleX + castleW - 1;
        if (rightX >= 0 && rightX < cols) map[cy][rightX] = TILE.CASTLE_WALL;
      }
      // Scatter some ruins around the castle
      for (var ri = 0; ri < 5; ri++) {
        var rx = castleX - 2 + Math.floor(rng() * (castleW + 4));
        var ry = castleY - 2 + Math.floor(rng() * (castleH + 4));
        if (rx >= 0 && rx < cols && ry >= 0 && ry < rows && map[ry][rx] !== TILE.CASTLE_WALL && map[ry][rx] !== TILE.CASTLE_FLOOR) {
          map[ry][rx] = rng() < 0.5 ? TILE.RUINS_1 : TILE.RUINS_2;
        }
      }
    }

    // --- Sci-Fi Zone: Tech area (lower-right quadrant) ---
    var techX = Math.floor(cols * 0.65);
    var techY = Math.floor(rows * 0.6);
    var techW = Math.min(8, cols - techX - 1);
    var techH = Math.min(5, rows - techY - 1);
    if (techX > 0 && techY > 0 && techX + techW <= cols && techY + techH <= rows) {
      // Metal floor base
      for (var ty = techY; ty < techY + techH && ty < rows; ty++) {
        for (var tx = techX; tx < techX + techW && tx < cols; tx++) {
          map[ty][tx] = TILE.METAL_FLOOR;
        }
      }
      // Tech panels along edges
      for (var tx = techX; tx < techX + techW && tx < cols; tx++) {
        if (techY >= 0 && techY < rows) map[techY][tx] = rng() < 0.5 ? TILE.TECH_PANEL_1 : TILE.TECH_PANEL_2;
        var btmY = techY + techH - 1;
        if (btmY >= 0 && btmY < rows) map[btmY][tx] = rng() < 0.5 ? TILE.TECH_PANEL_1 : TILE.TECH_PANEL_2;
      }
      // Energy tiles in center
      var eCenterX = techX + Math.floor(techW / 2);
      var eCenterY = techY + Math.floor(techH / 2);
      if (eCenterY >= 0 && eCenterY < rows && eCenterX >= 0 && eCenterX < cols) {
        map[eCenterY][eCenterX] = TILE.ENERGY_BLUE;
        if (eCenterX - 1 >= 0) map[eCenterY][eCenterX - 1] = TILE.ENERGY_PURPLE;
        if (eCenterX + 1 < cols) map[eCenterY][eCenterX + 1] = TILE.ENERGY_PURPLE;
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
    } else if (tileId === TILE.CASTLE_WALL) {
      // Castle wall: stone brick pattern
      ctx.fillStyle = shadeColor(baseColor, 10);
      ctx.fillRect(screenX, screenY, 7 * px, 7 * px);
      ctx.fillRect(screenX + 8 * px, screenY, 8 * px, 7 * px);
      ctx.fillRect(screenX + 3 * px, screenY + 8 * px, 10 * px, 7 * px);
      // Mortar lines
      ctx.fillStyle = shadeColor(baseColor, -15);
      ctx.fillRect(screenX + 7 * px, screenY, px, 7 * px);
      ctx.fillRect(screenX, screenY + 7 * px, 16 * px, px);
      ctx.fillRect(screenX + 3 * px, screenY + 8 * px, px, 7 * px);
      ctx.fillRect(screenX + 13 * px, screenY + 8 * px, px, 7 * px);
    } else if (tileId === TILE.CASTLE_FLOOR) {
      // Castle floor: smooth stone with subtle cracks
      ctx.fillStyle = shadeColor(baseColor, -8);
      ctx.fillRect(screenX + 3 * px, screenY + 4 * px, 6 * px, px);
      ctx.fillRect(screenX + 9 * px, screenY + 10 * px, 4 * px, px);
      ctx.fillStyle = shadeColor(baseColor, 8);
      ctx.fillRect(screenX + 6 * px, screenY + 8 * px, px, px);
    } else if (tileId === TILE.RUINS_1 || tileId === TILE.RUINS_2) {
      // Ruins: broken stone blocks with moss
      ctx.fillStyle = shadeColor(baseColor, 12);
      ctx.fillRect(screenX + 2 * px, screenY + 4 * px, 5 * px, 4 * px);
      ctx.fillRect(screenX + 9 * px, screenY + 8 * px, 4 * px, 3 * px);
      ctx.fillStyle = '#3a6a2a'; // moss accent
      ctx.fillRect(screenX + 2 * px, screenY + 7 * px, 3 * px, px);
      ctx.fillRect(screenX + 10 * px, screenY + 11 * px, 2 * px, px);
    } else if (tileId === TILE.TECH_PANEL_1 || tileId === TILE.TECH_PANEL_2) {
      // Tech panel: metal plate with rivets and glowing indicator
      ctx.fillStyle = shadeColor(baseColor, 8);
      ctx.fillRect(screenX + px, screenY + px, 14 * px, 14 * px);
      // Rivets
      ctx.fillStyle = shadeColor(baseColor, 20);
      ctx.fillRect(screenX + 2 * px, screenY + 2 * px, px, px);
      ctx.fillRect(screenX + 13 * px, screenY + 2 * px, px, px);
      ctx.fillRect(screenX + 2 * px, screenY + 13 * px, px, px);
      ctx.fillRect(screenX + 13 * px, screenY + 13 * px, px, px);
      // Glowing indicator strip
      ctx.fillStyle = tileId === TILE.TECH_PANEL_1 ? '#4a8aff' : '#ff8a4a';
      ctx.fillRect(screenX + 5 * px, screenY + 7 * px, 6 * px, 2 * px);
    } else if (tileId === TILE.ENERGY_BLUE || tileId === TILE.ENERGY_PURPLE) {
      // Energy tile: glowing energy grid
      var eColor = tileId === TILE.ENERGY_BLUE ? '#3a7aff' : '#8a3aff';
      ctx.fillStyle = eColor;
      ctx.fillRect(screenX + 2 * px, screenY + 2 * px, 12 * px, 12 * px);
      // Inner glow
      var eLight = tileId === TILE.ENERGY_BLUE ? '#6abaff' : '#ba6aff';
      ctx.fillStyle = eLight;
      ctx.fillRect(screenX + 4 * px, screenY + 4 * px, 8 * px, 8 * px);
      // Grid lines
      ctx.fillStyle = shadeColor(baseColor, -10);
      ctx.fillRect(screenX + 7 * px, screenY + 2 * px, px, 12 * px);
      ctx.fillRect(screenX + 2 * px, screenY + 7 * px, 12 * px, px);
    } else if (tileId === TILE.METAL_FLOOR) {
      // Metal floor: industrial plate with subtle diamond pattern
      ctx.fillStyle = shadeColor(baseColor, 6);
      ctx.fillRect(screenX + 4 * px, screenY + 4 * px, 2 * px, 2 * px);
      ctx.fillRect(screenX + 10 * px, screenY + 10 * px, 2 * px, 2 * px);
      ctx.fillStyle = shadeColor(baseColor, -6);
      ctx.fillRect(screenX + 7 * px, screenY + 7 * px, px, px);
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
           tileId === TILE.TREE_1  || tileId === TILE.TREE_2 ||
           tileId === TILE.CASTLE_WALL ||
           tileId === TILE.TECH_PANEL_1 || tileId === TILE.TECH_PANEL_2;
  }

  // ---------------------------------------------------------------------------
  // Interactive World Objects
  // ---------------------------------------------------------------------------

  var worldObjects = [];
  var interactionEffect = null; // { text, x, y, timer }

  /**
   * Object type definitions with interaction data.
   */
  var OBJ_TYPES = {
    CHEST: {
      name: 'chest',
      message: 'You found a treasure chest! It glimmers with ancient gold.',
      color: '#8a6a2a',
    },
    SIGN: {
      name: 'sign',
      message: 'Welcome, adventurer! Danger lies ahead...',
      color: '#6a5a3a',
    },
    ORB: {
      name: 'orb',
      message: 'The orb pulses with mysterious energy!',
      color: '#3ae8a0',
    },
    SWORD: {
      name: 'sword',
      message: 'A legendary sword embedded in stone. You are not yet worthy.',
      color: '#b0b0c0',
    },
    CRASHED_SHIP: {
      name: 'crashed_ship',
      message: 'A crashed starship! Its hull still hums with residual power.',
      color: '#6a7a8a',
    },
    CRYSTAL: {
      name: 'crystal',
      message: 'Arcane crystals pulse with ancient magical energy.',
      color: '#8a4ae8',
    },
    TERMINAL: {
      name: 'terminal',
      message: 'A computer terminal. The screen flickers: SYSTEM ONLINE...',
      color: '#3ae860',
    },
    PORTAL: {
      name: 'portal',
      message: 'A shimmering portal between dimensions. Where does it lead?',
      color: '#4ac8ff',
    },
    CAMPFIRE: {
      name: 'campfire',
      message: 'A warm campfire crackles. Someone was here recently.',
      color: '#e8a43a',
    },
    TELESCOPE: {
      name: 'telescope',
      message: 'A brass telescope pointed at the stars. Ancient and futuristic at once.',
      color: '#c0a040',
    },
  };

  /**
   * Check if a world object occupies a given tile.
   */
  function getObjectAtTile(tx, ty) {
    for (var i = 0; i < worldObjects.length; i++) {
      if (worldObjects[i].tileX === tx && worldObjects[i].tileY === ty) {
        return worldObjects[i];
      }
    }
    return null;
  }

  /**
   * Check if a tile is blocked by a world object.
   */
  function isObjectBlocking(tx, ty) {
    return getObjectAtTile(tx, ty) !== null;
  }

  /**
   * Get the tile the player is facing (adjacent tile in current direction).
   */
  function getFacingTile() {
    var dx = 0, dy = 0;
    if (player.direction === DIR.UP) dy = -1;
    else if (player.direction === DIR.DOWN) dy = 1;
    else if (player.direction === DIR.LEFT) dx = -1;
    else if (player.direction === DIR.RIGHT) dx = 1;
    return { x: player.tileX + dx, y: player.tileY + dy };
  }

  /**
   * Check if player is adjacent to a specific tile position.
   */
  function isPlayerAdjacentTo(tx, ty) {
    var adx = Math.abs(player.tileX - tx);
    var ady = Math.abs(player.tileY - ty);
    return (adx + ady) === 1;
  }

  /**
   * Find the nearest interactable object the player is facing.
   */
  function getNearbyInteractable() {
    var facing = getFacingTile();
    return getObjectAtTile(facing.x, facing.y);
  }

  /**
   * Trigger an interaction with a world object.
   */
  function interactWithObject(obj) {
    interactionEffect = {
      text: obj.type.message,
      x: obj.tileX * DRAWN_TILE + DRAWN_TILE / 2,
      y: obj.tileY * DRAWN_TILE - 10,
      timer: 2500,
      color: obj.type.color,
    };
    obj.interactAnim = 300; // ms of bounce animation
  }

  /**
   * Place world objects on valid walkable tiles.
   * Uses seeded RNG for deterministic placement.
   */
  function placeWorldObjects() {
    worldObjects = [];
    var rng = seededRandom(9001);

    // Collect walkable tiles (not solid, not water, not tree, not player spawn)
    var walkable = [];
    for (var y = 1; y < mapRows - 1; y++) {
      for (var x = 1; x < mapCols - 1; x++) {
        if (!isSolidTile(tileMap[y][x])) {
          // Skip tiles too close to player spawn
          var pdx = Math.abs(x - player.tileX);
          var pdy = Math.abs(y - player.tileY);
          if (pdx + pdy > 3) {
            walkable.push({ x: x, y: y });
          }
        }
      }
    }

    // Shuffle walkable tiles
    for (var i = walkable.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = walkable[i];
      walkable[i] = walkable[j];
      walkable[j] = tmp;
    }

    // Place objects ensuring minimum spacing
    var typeList = [
      OBJ_TYPES.CHEST, OBJ_TYPES.SIGN, OBJ_TYPES.ORB, OBJ_TYPES.SWORD,
      OBJ_TYPES.CRASHED_SHIP, OBJ_TYPES.CRYSTAL, OBJ_TYPES.TERMINAL,
      OBJ_TYPES.PORTAL, OBJ_TYPES.CAMPFIRE, OBJ_TYPES.TELESCOPE
    ];
    var placed = 0;
    var minSpacing = 3;

    for (var w = 0; w < walkable.length && placed < typeList.length; w++) {
      var candidate = walkable[w];
      var tooClose = false;

      for (var p = 0; p < worldObjects.length; p++) {
        var odx = Math.abs(candidate.x - worldObjects[p].tileX);
        var ody = Math.abs(candidate.y - worldObjects[p].tileY);
        if (odx + ody < minSpacing) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        worldObjects.push({
          tileX: candidate.x,
          tileY: candidate.y,
          type: typeList[placed],
          interactAnim: 0,
        });
        placed++;
      }
    }
  }

  /**
   * Update world object animations and interaction effects each frame.
   */
  function updateWorldObjects(dt) {
    // Update object interaction bounce animations
    for (var i = 0; i < worldObjects.length; i++) {
      if (worldObjects[i].interactAnim > 0) {
        worldObjects[i].interactAnim -= dt;
        if (worldObjects[i].interactAnim < 0) worldObjects[i].interactAnim = 0;
      }
    }

    // Update interaction effect timer
    if (interactionEffect && interactionEffect.timer > 0) {
      interactionEffect.timer -= dt;
      if (interactionEffect.timer <= 0) {
        interactionEffect = null;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // World Object Sprite Renderers (pixel art with canvas primitives)
  // ---------------------------------------------------------------------------

  /**
   * Draw a treasure chest sprite.
   */
  function drawChest(ctx, sx, sy, animOffset) {
    var px = SCALE;
    var ay = animOffset || 0;

    // Chest body
    ctx.fillStyle = '#8a6a2a';
    ctx.fillRect(sx + 3 * px, sy + 7 * px + ay, 10 * px, 6 * px);
    // Chest lid
    ctx.fillStyle = '#a07a30';
    ctx.fillRect(sx + 3 * px, sy + 5 * px + ay, 10 * px, 3 * px);
    // Lid top curve
    ctx.fillStyle = '#b08a3a';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, 8 * px, 2 * px);
    // Metal band
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(sx + 3 * px, sy + 8 * px + ay, 10 * px, px);
    // Lock
    ctx.fillStyle = '#e8d44a';
    ctx.fillRect(sx + 7 * px, sy + 9 * px + ay, 2 * px, 2 * px);
    // Keyhole
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(sx + 7 * px, sy + 10 * px + ay, px, px);
    // Dark edge
    ctx.fillStyle = '#5a4a1a';
    ctx.fillRect(sx + 3 * px, sy + 12 * px + ay, 10 * px, px);
  }

  /**
   * Draw a sign post sprite.
   */
  function drawSign(ctx, sx, sy, animOffset) {
    var px = SCALE;
    var ay = animOffset || 0;

    // Post
    ctx.fillStyle = '#6a5a3a';
    ctx.fillRect(sx + 7 * px, sy + 8 * px + ay, 2 * px, 7 * px);
    // Sign board
    ctx.fillStyle = '#8a7a50';
    ctx.fillRect(sx + 3 * px, sy + 3 * px + ay, 10 * px, 6 * px);
    // Sign face
    ctx.fillStyle = '#a09060';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, 8 * px, 4 * px);
    // Text lines on sign
    ctx.fillStyle = '#3a3020';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, 6 * px, px);
    ctx.fillRect(sx + 5 * px, sy + 7 * px + ay, 4 * px, px);
    // Sign top edge highlight
    ctx.fillStyle = '#b0a070';
    ctx.fillRect(sx + 3 * px, sy + 3 * px + ay, 10 * px, px);
  }

  /**
   * Draw a glowing orb sprite.
   */
  function drawOrb(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var pulse = Math.sin((time || 0) * 0.004) * 0.3 + 0.7;

    // Pedestal
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(sx + 5 * px, sy + 11 * px, 6 * px, 3 * px);
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(sx + 4 * px, sy + 13 * px, 8 * px, 2 * px);

    // Outer glow
    ctx.fillStyle = 'rgba(58, 232, 160, ' + (0.2 * pulse) + ')';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, 8 * px, 8 * px);

    // Orb body
    ctx.fillStyle = 'rgba(58, 200, 140, ' + (0.8 * pulse) + ')';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, 6 * px, 6 * px);

    // Inner highlight
    ctx.fillStyle = 'rgba(140, 255, 200, ' + (0.6 * pulse) + ')';
    ctx.fillRect(sx + 6 * px, sy + 6 * px + ay, 3 * px, 3 * px);

    // Sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.5 * pulse) + ')';
    ctx.fillRect(sx + 7 * px, sy + 6 * px + ay, px, px);
  }

  /**
   * Draw a sword in stone sprite.
   */
  function drawSwordInStone(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var shimmer = Math.sin((time || 0) * 0.003) * 0.2 + 0.8;

    // Stone base
    ctx.fillStyle = '#6a6a70';
    ctx.fillRect(sx + 3 * px, sy + 10 * px, 10 * px, 4 * px);
    ctx.fillStyle = '#5a5a62';
    ctx.fillRect(sx + 4 * px, sy + 9 * px, 8 * px, 2 * px);
    // Stone highlight
    ctx.fillStyle = '#7a7a82';
    ctx.fillRect(sx + 5 * px, sy + 10 * px, 4 * px, px);

    // Sword blade
    ctx.fillStyle = 'rgba(180, 180, 210, ' + shimmer + ')';
    ctx.fillRect(sx + 7 * px, sy + 2 * px + ay, 2 * px, 8 * px);
    // Blade highlight
    ctx.fillStyle = 'rgba(220, 220, 240, ' + (shimmer * 0.7) + ')';
    ctx.fillRect(sx + 7 * px, sy + 2 * px + ay, px, 6 * px);
    // Blade tip
    ctx.fillStyle = 'rgba(200, 200, 230, ' + shimmer + ')';
    ctx.fillRect(sx + 7 * px, sy + 1 * px + ay, 2 * px, px);

    // Guard / crosspiece
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(sx + 5 * px, sy + 9 * px + ay, 6 * px, px);

    // Grip
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(sx + 7 * px, sy + 10 * px + ay, 2 * px, px);

    // Pommel gem
    ctx.fillStyle = '#e03030';
    ctx.fillRect(sx + 7 * px, sy + 11 * px + ay, 2 * px, px);
  }

  /**
   * Draw a crashed spaceship sprite.
   */
  function drawCrashedShip(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var flicker = Math.sin((time || 0) * 0.008) * 0.3 + 0.7;

    // Ship hull (main body)
    ctx.fillStyle = '#5a6a7a';
    ctx.fillRect(sx + 2 * px, sy + 7 * px + ay, 12 * px, 5 * px);
    // Cockpit dome
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, 8 * px, 4 * px);
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(sx + 5 * px, sy + 3 * px + ay, 6 * px, 2 * px);
    // Windshield (teal glow)
    ctx.fillStyle = 'rgba(74, 200, 220, ' + flicker + ')';
    ctx.fillRect(sx + 6 * px, sy + 5 * px + ay, 4 * px, 2 * px);
    // Wing stubs (damaged/tilted)
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(sx + px, sy + 9 * px + ay, 2 * px, 2 * px);
    ctx.fillRect(sx + 13 * px, sy + 8 * px + ay, 2 * px, 3 * px);
    // Engine glow (orange, flickering)
    ctx.fillStyle = 'rgba(255, 140, 40, ' + (flicker * 0.6) + ')';
    ctx.fillRect(sx + 5 * px, sy + 11 * px + ay, 2 * px, 2 * px);
    ctx.fillRect(sx + 9 * px, sy + 11 * px + ay, 2 * px, 2 * px);
    // Damage marks
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(sx + 3 * px, sy + 8 * px + ay, px, 2 * px);
    ctx.fillRect(sx + 10 * px, sy + 7 * px + ay, px, px);
    // Sparks
    ctx.fillStyle = 'rgba(255, 220, 80, ' + (flicker * 0.8) + ')';
    ctx.fillRect(sx + 11 * px, sy + 6 * px + ay, px, px);
  }

  /**
   * Draw crystal formation sprite.
   */
  function drawCrystal(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var glow = Math.sin((time || 0) * 0.005) * 0.25 + 0.75;

    // Base rock
    ctx.fillStyle = '#4a4a50';
    ctx.fillRect(sx + 3 * px, sy + 12 * px, 10 * px, 3 * px);

    // Large crystal (center, purple)
    ctx.fillStyle = 'rgba(138, 74, 232, ' + glow + ')';
    ctx.fillRect(sx + 6 * px, sy + 3 * px + ay, 4 * px, 10 * px);
    ctx.fillRect(sx + 7 * px, sy + 2 * px + ay, 2 * px, px);
    // Crystal highlight
    ctx.fillStyle = 'rgba(180, 140, 255, ' + (glow * 0.7) + ')';
    ctx.fillRect(sx + 7 * px, sy + 4 * px + ay, px, 5 * px);

    // Small crystal (left, blue)
    ctx.fillStyle = 'rgba(74, 140, 232, ' + glow + ')';
    ctx.fillRect(sx + 3 * px, sy + 7 * px + ay, 3 * px, 6 * px);
    ctx.fillRect(sx + 4 * px, sy + 6 * px + ay, px, px);

    // Small crystal (right, pink)
    ctx.fillStyle = 'rgba(200, 80, 180, ' + glow + ')';
    ctx.fillRect(sx + 11 * px, sy + 8 * px + ay, 2 * px, 5 * px);
    ctx.fillRect(sx + 11 * px, sy + 7 * px + ay, px, px);
  }

  /**
   * Draw computer terminal sprite.
   */
  function drawTerminal(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var blink = Math.sin((time || 0) * 0.006) > 0 ? 1 : 0.5;

    // Terminal base/stand
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(sx + 4 * px, sy + 12 * px + ay, 8 * px, 3 * px);
    ctx.fillRect(sx + 6 * px, sy + 10 * px + ay, 4 * px, 2 * px);
    // Screen housing
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(sx + 3 * px, sy + 3 * px + ay, 10 * px, 8 * px);
    // Screen (green phosphor glow)
    ctx.fillStyle = 'rgba(58, 232, 96, ' + (0.7 * blink) + ')';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, 8 * px, 6 * px);
    // Text lines on screen
    ctx.fillStyle = 'rgba(100, 255, 140, ' + blink + ')';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, 5 * px, px);
    ctx.fillRect(sx + 5 * px, sy + 7 * px + ay, 6 * px, px);
    ctx.fillRect(sx + 5 * px, sy + 9 * px + ay, 3 * px, px);
    // Blinking cursor
    ctx.fillStyle = 'rgba(150, 255, 180, ' + blink + ')';
    ctx.fillRect(sx + 9 * px, sy + 9 * px + ay, px, px);
    // Status LED
    ctx.fillStyle = 'rgba(255, 80, 40, ' + blink + ')';
    ctx.fillRect(sx + 11 * px, sy + 3 * px + ay, px, px);
  }

  /**
   * Draw portal/warp pad sprite.
   */
  function drawPortal(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var spin = ((time || 0) * 0.003) % (Math.PI * 2);
    var pulse = Math.sin(spin) * 0.3 + 0.7;
    var pulse2 = Math.sin(spin + 2) * 0.3 + 0.7;

    // Pad base
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(sx + 2 * px, sy + 12 * px, 12 * px, 3 * px);
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(sx + 3 * px, sy + 11 * px, 10 * px, 2 * px);

    // Portal energy ring (outer)
    ctx.fillStyle = 'rgba(74, 200, 255, ' + (0.5 * pulse) + ')';
    ctx.fillRect(sx + 3 * px, sy + 3 * px + ay, 10 * px, 9 * px);
    // Inner void
    ctx.fillStyle = 'rgba(20, 10, 50, 0.9)';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, 6 * px, 5 * px);
    // Swirling energy
    ctx.fillStyle = 'rgba(100, 180, 255, ' + (0.6 * pulse2) + ')';
    ctx.fillRect(sx + 6 * px, sy + 6 * px + ay, 2 * px, px);
    ctx.fillRect(sx + 8 * px, sy + 8 * px + ay, 2 * px, px);
    ctx.fillStyle = 'rgba(180, 100, 255, ' + (0.5 * pulse) + ')';
    ctx.fillRect(sx + 7 * px, sy + 7 * px + ay, 2 * px, 2 * px);
    // Sparks around portal
    ctx.fillStyle = 'rgba(200, 240, 255, ' + (0.7 * pulse2) + ')';
    ctx.fillRect(sx + 4 * px, sy + 4 * px + ay, px, px);
    ctx.fillRect(sx + 11 * px, sy + 6 * px + ay, px, px);
    ctx.fillRect(sx + 5 * px, sy + 10 * px + ay, px, px);
  }

  /**
   * Draw campfire sprite.
   */
  function drawCampfire(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var flamePhase = Math.sin((time || 0) * 0.01) * 0.3 + 0.7;
    var flamePhase2 = Math.sin((time || 0) * 0.013 + 1) * 0.3 + 0.7;

    // Stone ring
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(sx + 3 * px, sy + 11 * px, 10 * px, 3 * px);
    ctx.fillRect(sx + 2 * px, sy + 12 * px, 12 * px, 2 * px);
    // Logs
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(sx + 4 * px, sy + 10 * px + ay, 8 * px, 2 * px);
    ctx.fillStyle = '#4a2a10';
    ctx.fillRect(sx + 5 * px, sy + 9 * px + ay, 6 * px, 2 * px);
    // Fire base (orange)
    ctx.fillStyle = 'rgba(232, 140, 40, ' + flamePhase + ')';
    ctx.fillRect(sx + 6 * px, sy + 6 * px + ay, 4 * px, 4 * px);
    // Fire mid (yellow)
    ctx.fillStyle = 'rgba(255, 200, 40, ' + flamePhase2 + ')';
    ctx.fillRect(sx + 7 * px, sy + 4 * px + ay, 2 * px, 4 * px);
    // Fire tip (bright)
    ctx.fillStyle = 'rgba(255, 240, 120, ' + flamePhase + ')';
    ctx.fillRect(sx + 7 * px, sy + 3 * px + ay, 2 * px, 2 * px);
    // Sparks
    ctx.fillStyle = 'rgba(255, 180, 60, ' + (flamePhase2 * 0.6) + ')';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, px, px);
    ctx.fillRect(sx + 10 * px, sy + 4 * px + ay, px, px);
    // Embers
    ctx.fillStyle = 'rgba(255, 100, 30, ' + flamePhase + ')';
    ctx.fillRect(sx + 9 * px, sy + 2 * px + ay, px, px);
  }

  /**
   * Draw telescope sprite.
   */
  function drawTelescope(ctx, sx, sy, animOffset, time) {
    var px = SCALE;
    var ay = animOffset || 0;
    var glint = Math.sin((time || 0) * 0.004) * 0.3 + 0.7;

    // Tripod legs
    ctx.fillStyle = '#6a5a3a';
    ctx.fillRect(sx + 4 * px, sy + 10 * px, px, 5 * px);
    ctx.fillRect(sx + 11 * px, sy + 10 * px, px, 5 * px);
    ctx.fillRect(sx + 7 * px, sy + 12 * px, 2 * px, 3 * px);
    // Tripod center joint
    ctx.fillStyle = '#8a7a50';
    ctx.fillRect(sx + 6 * px, sy + 10 * px, 4 * px, 2 * px);
    // Telescope tube (angled)
    ctx.fillStyle = '#c0a040';
    ctx.fillRect(sx + 4 * px, sy + 5 * px + ay, 8 * px, 3 * px);
    ctx.fillRect(sx + 3 * px, sy + 4 * px + ay, 3 * px, 2 * px);
    // Brass highlight
    ctx.fillStyle = 'rgba(220, 180, 80, ' + glint + ')';
    ctx.fillRect(sx + 5 * px, sy + 5 * px + ay, 6 * px, px);
    // Lens (glass with blue tint)
    ctx.fillStyle = 'rgba(100, 180, 240, ' + glint + ')';
    ctx.fillRect(sx + 3 * px, sy + 4 * px + ay, px, 2 * px);
    // Eyepiece
    ctx.fillStyle = '#8a6a30';
    ctx.fillRect(sx + 12 * px, sy + 5 * px + ay, 2 * px, 2 * px);
    // Satellite dish addon (sci-fi juxtaposition!)
    ctx.fillStyle = '#7a8a9a';
    ctx.fillRect(sx + 9 * px, sy + 2 * px + ay, 4 * px, 2 * px);
    ctx.fillRect(sx + 10 * px, sy + 1 * px + ay, 2 * px, px);
    // Antenna
    ctx.fillStyle = '#aabaca';
    ctx.fillRect(sx + 11 * px, sy + px + ay, px, px);
    // Blinking light on dish
    ctx.fillStyle = 'rgba(255, 60, 40, ' + glint + ')';
    ctx.fillRect(sx + 11 * px, sy + 2 * px + ay, px, px);
  }

  /**
   * Draw a world object at its tile position.
   */
  function drawWorldObject(ctx, obj, time) {
    var sx = obj.tileX * DRAWN_TILE;
    var sy = obj.tileY * DRAWN_TILE;
    var animOffset = 0;

    // Bounce animation on interaction
    if (obj.interactAnim > 0) {
      animOffset = -Math.sin(obj.interactAnim / 300 * Math.PI) * SCALE * 2;
    }

    if (obj.type === OBJ_TYPES.CHEST) {
      drawChest(ctx, sx, sy, animOffset);
    } else if (obj.type === OBJ_TYPES.SIGN) {
      drawSign(ctx, sx, sy, animOffset);
    } else if (obj.type === OBJ_TYPES.ORB) {
      drawOrb(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.SWORD) {
      drawSwordInStone(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.CRASHED_SHIP) {
      drawCrashedShip(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.CRYSTAL) {
      drawCrystal(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.TERMINAL) {
      drawTerminal(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.PORTAL) {
      drawPortal(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.CAMPFIRE) {
      drawCampfire(ctx, sx, sy, animOffset, time);
    } else if (obj.type === OBJ_TYPES.TELESCOPE) {
      drawTelescope(ctx, sx, sy, animOffset, time);
    }
  }

  /**
   * Draw interaction indicator ("!") above an interactable object the player faces.
   */
  function drawInteractionIndicator(ctx, obj, time) {
    var sx = obj.tileX * DRAWN_TILE;
    var sy = obj.tileY * DRAWN_TILE;
    var bob = Math.sin(time * 0.006) * SCALE * 1.5;
    var pulse = Math.sin(time * 0.004) * 0.3 + 0.7;

    // Draw "!" bubble
    var bx = sx + DRAWN_TILE / 2 - 3 * SCALE;
    var by = sy - 4 * SCALE + bob;

    // Bubble background
    ctx.fillStyle = 'rgba(232, 212, 74, ' + pulse + ')';
    ctx.fillRect(bx, by, 6 * SCALE, 7 * SCALE);

    // "!" character
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(bx + 2 * SCALE, by + SCALE, 2 * SCALE, 3 * SCALE);
    ctx.fillRect(bx + 2 * SCALE, by + 5 * SCALE, 2 * SCALE, SCALE);
  }

  /**
   * Draw the interaction effect (message popup).
   */
  function drawInteractionEffect(ctx, effect) {
    if (!effect || effect.timer <= 0) return;

    var alpha = Math.min(1, effect.timer / 500);
    var textScale = 2;
    var maxCharsPerLine = 30;
    var words = effect.text.split(' ');
    var lines = [];
    var currentLine = '';

    for (var i = 0; i < words.length; i++) {
      var testLine = currentLine.length > 0 ? currentLine + ' ' + words[i] : words[i];
      if (testLine.length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // Calculate box dimensions
    var maxWidth = 0;
    for (var l = 0; l < lines.length; l++) {
      var w = measurePixelText(lines[l], textScale);
      if (w > maxWidth) maxWidth = w;
    }
    var lineHeight = 7 * textScale + 4;
    var boxW = maxWidth + 20;
    var boxH = lines.length * lineHeight + 16;
    var boxX = Math.floor((canvas.width - boxW) / 2);
    var boxY = canvas.height - boxH - 20;

    // Box background
    ctx.fillStyle = 'rgba(10, 26, 10, ' + (0.9 * alpha) + ')';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Box border
    ctx.fillStyle = 'rgba(106, 170, 58, ' + (0.8 * alpha) + ')';
    ctx.fillRect(boxX, boxY, boxW, 2);
    ctx.fillRect(boxX, boxY + boxH - 2, boxW, 2);
    ctx.fillRect(boxX, boxY, 2, boxH);
    ctx.fillRect(boxX + boxW - 2, boxY, 2, boxH);

    // Corner accents
    ctx.fillStyle = 'rgba(232, 212, 74, ' + (0.7 * alpha) + ')';
    ctx.fillRect(boxX, boxY, 6, 2);
    ctx.fillRect(boxX, boxY, 2, 6);
    ctx.fillRect(boxX + boxW - 6, boxY, 6, 2);
    ctx.fillRect(boxX + boxW - 2, boxY, 2, 6);
    ctx.fillRect(boxX, boxY + boxH - 2, 6, 2);
    ctx.fillRect(boxX, boxY + boxH - 6, 2, 6);
    ctx.fillRect(boxX + boxW - 6, boxY + boxH - 2, 6, 2);
    ctx.fillRect(boxX + boxW - 2, boxY + boxH - 6, 2, 6);

    // Draw text lines
    for (var l = 0; l < lines.length; l++) {
      var tw = measurePixelText(lines[l], textScale);
      var tx = boxX + Math.floor((boxW - tw) / 2);
      var ty = boxY + 10 + l * lineHeight;
      drawPixelText(ctx, lines[l], tx, ty, textScale, 'rgba(200, 230, 180, ' + alpha + ')');
    }
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
    '\'': [0x00,0x03,0x03,0x00,0x00],
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

    // Interaction: spacebar or enter
    if ((e.key === ' ' || e.key === 'Enter') && gameState === STATE.PLAYING) {
      e.preventDefault();
      var nearObj = getNearbyInteractable();
      if (nearObj) {
        interactWithObject(nearObj);
      }
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

    // Collision check (tiles and objects)
    if (isSolidTile(tileMap[newTY][newTX])) {
      return false;
    }
    if (isObjectBlocking(newTX, newTY)) {
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

    // Place interactive objects on valid tiles
    placeWorldObjects();
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

    // Draw world objects
    for (var oi = 0; oi < worldObjects.length; oi++) {
      drawWorldObject(ctx, worldObjects[oi], titleTime);
    }

    // Draw player on top
    drawPlayer(ctx, player.screenX, player.screenY, player.direction, player.walkFrame);

    // Draw interaction indicator if player faces an interactable
    var nearInteractable = getNearbyInteractable();
    if (nearInteractable) {
      drawInteractionIndicator(ctx, nearInteractable, titleTime);
    }

    // Draw interaction effect popup
    drawInteractionEffect(ctx, interactionEffect);
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
      updateWorldObjects(dt);
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
      updateWorldObjects(dt);
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
