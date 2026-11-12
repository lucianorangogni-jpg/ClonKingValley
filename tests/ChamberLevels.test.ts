import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChamberLevels, levelData } from '../src/grid/ChamberLevels.ts';
import { ChamberGrid } from '../src/grid/ChamberGrid.ts';
import { TileType } from '../src/grid/TileType.ts';
import { GameConstants } from '../src/core/GameConstants.ts';

describe('ChamberLevels Design Validation', () => {
    it('should validate the exact 32x21 reference matrix levelData for PYRAMID-02', () => {
        assert.equal(levelData.length, GameConstants.GRID_ROWS);
        for (let r = 0; r < levelData.length; r++) {
            assert.equal(levelData[r].length, GameConstants.GRID_COLS, `Row ${r} must be 32 columns wide`);
        }

        const pyramid2 = ChamberLevels.getLevel(2);
        assert.equal(pyramid2.gems.length, 2);
        assert.equal(pyramid2.pickaxes.length, 5);
        assert.equal(pyramid2.knives.length, 2);
        assert.equal(pyramid2.mummies.length, 2);
        // Pink diamond inside central C-vault + green emerald on mid-right platform
        assert.deepEqual(pyramid2.gems.map((g) => ({ col: g.col, row: g.row, color: g.color })), [
            { col: 18, row: 9, color: 'pink' },
            { col: 23, row: 11, color: 'green' }
        ]);
    });

    for (let stage = 1; stage <= 5; stage++) {
        it(`should have complete and valid 32x21 structure for Stage ${stage}`, () => {
            const level = ChamberLevels.getLevel(stage);

            assert.equal(level.stage, stage);
            assert.ok(level.name.length > 0);

            // Verify grid dimensions (32 cols x 21 rows)
            assert.equal(level.layout.length, GameConstants.GRID_ROWS);
            for (let r = 0; r < level.layout.length; r++) {
                assert.equal(level.layout[r].length, GameConstants.GRID_COLS);
            }

            // Verify player spawn & exit door are within playable bounds
            assert.ok(level.playerSpawn.col >= 1 && level.playerSpawn.col < GameConstants.GRID_COLS - 1);
            assert.ok(level.playerSpawn.row >= 1 && level.playerSpawn.row < GameConstants.GRID_ROWS - 1);
            assert.ok(level.exitDoor.col >= 1 && level.exitDoor.col < GameConstants.GRID_COLS - 1);
            assert.ok(level.exitDoor.row >= 1 && level.exitDoor.row < GameConstants.GRID_ROWS - 1);

            // Verify collectibles and enemies
            assert.ok(level.gems.length >= 2, `Stage ${stage} must have at least 2 gems`);
            assert.ok(level.pickaxes.length >= 1, `Stage ${stage} must provide at least 1 pickaxe`);
            assert.ok(level.mummies.length >= 1, `Stage ${stage} must have mummies`);

            // Verify that ladders are continuous (either vertical or 2-tile diagonal) and accessible via ChamberGrid
            const grid = new ChamberGrid(GameConstants.GRID_COLS, GameConstants.GRID_ROWS, GameConstants.TILE_SIZE, GameConstants.HUD_HEIGHT);
            grid.loadLayout(level.layout);

            let totalLadderTiles = 0;
            for (let r = 0; r < GameConstants.GRID_ROWS; r++) {
                for (let c = 0; c < GameConstants.GRID_COLS; c++) {
                    if (level.layout[r][c] === TileType.Ladder) {
                        totalLadderTiles++;
                        const pos = grid.tileToWorld(c, r);
                        const info = grid.findAccessibleLadder(pos.x, pos.y + GameConstants.TILE_SIZE / 2);
                        assert.ok(info !== null, `Stage ${stage} ladder tile (${c},${r}) must resolve an accessible ladder`);
                    }
                }
            }
            assert.ok(totalLadderTiles >= 10, `Stage ${stage} must have functional staircases`);
        });
    }

    it('should provide distinct platform architectures across stages 1 to 5', () => {
        const signatures = new Set<string>();
        for (let stage = 1; stage <= 5; stage++) {
            const level = ChamberLevels.getLevel(stage);
            const sig = level.layout.map((row) => row.join(',')).join('|');
            assert.equal(signatures.has(sig), false, `Stage ${stage} must not repeat an earlier chamber layout`);
            signatures.add(sig);
        }
        assert.equal(signatures.size, 5);
    });
});
