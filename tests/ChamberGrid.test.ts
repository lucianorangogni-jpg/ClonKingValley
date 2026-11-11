import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChamberGrid } from '../src/grid/ChamberGrid.ts';
import { TileType } from '../src/grid/TileType.ts';

describe('ChamberGrid Logic and Mechanics', () => {
    it('should initialize with correct dimensions and boundaries', () => {
        const grid = new ChamberGrid(25, 18, 32);
        assert.equal(grid.cols, 25);
        assert.equal(grid.rows, 18);
        assert.equal(grid.tileSize, 32);
        assert.equal(grid.getTile(0, 0), TileType.Empty);
    });

    it('should treat out of bounds as solid walls', () => {
        const grid = new ChamberGrid(25, 18, 32);
        assert.equal(grid.isSolid(-1, 5), true);
        assert.equal(grid.isSolid(25, 5), true);
        assert.equal(grid.isSolid(5, -1), true);
        assert.equal(grid.isSolid(5, 18), true);
    });

    it('should identify solid, standable and ladder tiles correctly', () => {
        const grid = new ChamberGrid(10, 10, 32);
        grid.setTile(2, 2, TileType.SolidWall);
        grid.setTile(3, 2, TileType.Ladder);
        grid.setTile(4, 2, TileType.DiggableSandstone);
        grid.setTile(5, 2, TileType.Empty);

        assert.equal(grid.isSolid(2, 2), true);
        assert.equal(grid.isStandable(2, 2), true);

        assert.equal(grid.isLadder(3, 2), true);
        assert.equal(grid.isSolid(3, 2), false); // Ladders are not solid obstacles
        assert.equal(grid.isStandable(3, 2), true); // Top rung of ladder acts as platform bridge

        // Middle rung of ladder is not solid ground so entities can climb/fall through
        grid.setTile(3, 3, TileType.Ladder);
        assert.equal(grid.isLadder(3, 3), true);
        assert.equal(grid.isStandable(3, 3), false);

        assert.equal(grid.isDiggable(4, 2), true);
        assert.equal(grid.isSolid(4, 2), true);

        assert.equal(grid.isSolid(5, 2), false);
        assert.equal(grid.isStandable(5, 2), false);
    });

    it('should correctly progress sandstone digging from intact to cracked to empty', () => {
        const grid = new ChamberGrid(10, 10, 32);
        grid.setTile(5, 5, TileType.DiggableSandstone);

        assert.equal(grid.getTile(5, 5), TileType.DiggableSandstone);
        assert.equal(grid.isDiggable(5, 5), true);

        // First dig strike: cracks the block
        const brokeOnFirst = grid.digBlock(5, 5);
        assert.equal(brokeOnFirst, false);
        assert.equal(grid.getTile(5, 5), TileType.DiggableSandstoneCracked);
        assert.equal(grid.isDiggable(5, 5), true);

        // Second dig strike: clears the block completely
        const brokeOnSecond = grid.digBlock(5, 5);
        assert.equal(brokeOnSecond, true);
        assert.equal(grid.getTile(5, 5), TileType.Empty);
        assert.equal(grid.isDiggable(5, 5), false);
        assert.equal(grid.isSolid(5, 5), false);
    });

    it('should correctly convert between world pixels and grid tile coordinates', () => {
        const grid = new ChamberGrid(25, 18, 32);
        const tile = grid.worldToTile(64 + 16, 96 + 16);
        assert.equal(tile.col, 2);
        assert.equal(tile.row, 3);

        const world = grid.tileToWorld(2, 3);
        assert.equal(world.x, 80);
        assert.equal(world.y, 112);

        const bottomY = grid.tileBottomY(3);
        assert.equal(bottomY, 128);
    });

    it('should resolve diagonal staircases and vertical HUD offsets accurately', () => {
        const grid = new ChamberGrid(32, 21, 25, 75);
        // Set a 2-tile diagonal stair going down-left: (11,2)-(12,2) -> (10,3)-(11,3) -> (9,4)-(10,4)
        grid.setTile(11, 2, TileType.Ladder);
        grid.setTile(12, 2, TileType.Ladder);
        grid.setTile(10, 3, TileType.Ladder);
        grid.setTile(11, 3, TileType.Ladder);
        grid.setTile(9, 4, TileType.Ladder);
        grid.setTile(10, 4, TileType.Ladder);
        grid.setTile(9, 5, TileType.SolidWall);
        grid.setTile(10, 5, TileType.SolidWall);

        // Only top cap is standable, mid-air diagonal steps are not
        assert.equal(grid.isStandable(11, 2), true);
        assert.equal(grid.isStandable(12, 2), true);
        assert.equal(grid.isStandable(10, 3), false);

        // World coordinates account for HUD offsetY = 75
        assert.equal(grid.tileTopY(2), 75 + 2 * 25);
        assert.equal(grid.worldToTile(11 * 25 + 5, 75 + 2 * 25 + 5).row, 2);

        // Ladder accessibility from bottom floor (row 5 top) resolves full stair span
        const info = grid.findAccessibleLadder(9.5 * 25, grid.tileTopY(5));
        assert.ok(info !== null);
        assert.equal(info.slopeX, 1);
        assert.equal(info.topY, grid.tileTopY(2));
        assert.equal(info.bottomY, grid.tileTopY(5));
    });
});
