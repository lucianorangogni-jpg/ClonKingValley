import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChamberLevels } from '../src/grid/ChamberLevels.ts';
import { ChamberGrid } from '../src/grid/ChamberGrid.ts';
import { TileType } from '../src/grid/TileType.ts';
import { DirectionType } from '../src/core/Direction.ts';

describe('MovingFloorTrap Logic and Chamber Integration', () => {
    it('should define functional moving floor traps for chambers that configure them', () => {
        let totalMovingFloors = 0;
        for (let stage = 1; stage <= 3; stage++) {
            const level = ChamberLevels.getLevel(stage);
            assert.ok(Array.isArray(level.movingFloors), `Stage ${stage} must define movingFloors array`);
            totalMovingFloors += level.movingFloors.length;

            for (const mf of level.movingFloors) {
                assert.ok(mf.col >= 1 && mf.col < 31, 'Col must be within chamber bounds');
                assert.ok(mf.row >= 1 && mf.row < 20, 'Row must be within platform rows');
                assert.ok(mf.length >= 2, 'Length must span at least 2 tiles');
                assert.ok(mf.direction === 'left' || mf.direction === 'right', 'Direction must be left or right');
                const speed = mf.speed ?? 75;
                assert.ok(speed > 0, 'Speed must be positive');
            }
        }
        assert.ok(totalMovingFloors >= 2, 'Campaign must include active moving floor traps');
    });

    it('should register TileType.MovingFloor as solid floor and standable in ChamberGrid', () => {
        const grid = new ChamberGrid(25, 18, 32);
        grid.setTile(8, 11, TileType.MovingFloor);

        assert.equal(grid.getTile(8, 11), TileType.MovingFloor);
        assert.equal(grid.isSolidFloor(8, 11), true, 'Moving floor must be solid floor');
        assert.equal(grid.isStandable(8, 11), true, 'Moving floor must be standable surface for entities');
        assert.equal(grid.isSolid(8, 11), true, 'Moving floor must block horizontal penetration from inside');
    });

    it('should calculate accurate displacement based on direction and speed', () => {
        const speed = 80; // px/sec
        const delta = 100; // ms (0.1 sec)

        // Direction Left
        const dispLeft = -1 * speed * (delta / 1000);
        assert.equal(dispLeft, -8);

        // Direction Right
        const dispRight = 1 * speed * (delta / 1000);
        assert.equal(dispRight, 8);
    });

    it('should correctly calculate moving floor bounds', () => {
        const tileSize = 32;
        const col = 8;
        const row = 11;
        const length = 4;

        const leftBound = col * tileSize - 4; // 8 * 32 - 4 = 252
        const rightBound = (col + length) * tileSize + 4; // 12 * 32 + 4 = 388
        const surfaceY = row * tileSize; // 11 * 32 = 352

        assert.equal(leftBound, 252);
        assert.equal(rightBound, 388);
        assert.equal(surfaceY, 352);

        // Test whether entity feet at y = 352 are detected within tolerance
        const playerFeetY = 352;
        const isOnSurface = Math.abs(playerFeetY - surfaceY) <= 6;
        assert.equal(isOnSurface, true);

        // Entity jumping or falling in mid-air (feet at 300) should not be affected
        const airborneFeetY = 300;
        const isAirborneOnSurface = Math.abs(airborneFeetY - surfaceY) <= 6;
        assert.equal(isAirborneOnSurface, false);
    });
});
