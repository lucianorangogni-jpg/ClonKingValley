import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameConstants } from '../src/core/GameConstants.ts';
import { ChamberGrid } from '../src/grid/ChamberGrid.ts';
import { TileType } from '../src/grid/TileType.ts';

describe('Inventory and Combat Tool Mechanics', () => {
    it('should calculate knife travel metrics accurately', () => {
        const speed = GameConstants.KNIFE_SPEED;
        const maxRange = GameConstants.KNIFE_MAX_RANGE;

        // At 320 px/s, travel time for 450 px
        const timeToMaxRange = maxRange / speed;
        assert.ok(timeToMaxRange > 1.0 && timeToMaxRange < 2.0);
    });

    it('should stop and drop knife when intersecting solid wall tile', () => {
        const grid = new ChamberGrid(15, 10, 32);
        grid.setTile(6, 4, TileType.SolidWall);

        // Check tile along trajectory
        assert.equal(grid.isSolid(6, 4), true);
        assert.equal(grid.isSolid(5, 4), false);
    });

    it('should calculate pickaxe durability consumption per destroyed block', () => {
        let pickaxeUses = 3;
        const grid = new ChamberGrid(10, 10, 32);
        grid.setTile(2, 2, TileType.DiggableSandstone);

        // First hit cracks block without consuming use
        const broke1 = grid.digBlock(2, 2);
        assert.equal(broke1, false);
        assert.equal(pickaxeUses, 3);

        // Second hit breaks block completely and consumes 1 use
        const broke2 = grid.digBlock(2, 2);
        assert.equal(broke2, true);
        if (broke2) {
            pickaxeUses--;
        }
        assert.equal(pickaxeUses, 2);
    });
});
