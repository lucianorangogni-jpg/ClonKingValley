import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Direction, DirectionType } from '../src/core/Direction.ts';

describe('Direction Helper Logic', () => {
    it('should generate accurate unit vectors', () => {
        assert.deepEqual(Direction.toVector(DirectionType.Left), { x: -1, y: 0 });
        assert.deepEqual(Direction.toVector(DirectionType.Right), { x: 1, y: 0 });
        assert.deepEqual(Direction.toVector(DirectionType.Up), { x: 0, y: -1 });
        assert.deepEqual(Direction.toVector(DirectionType.Down), { x: 0, y: 1 });
        assert.deepEqual(Direction.toVector(DirectionType.None), { x: 0, y: 0 });
    });

    it('should calculate opposite directions properly', () => {
        assert.equal(Direction.getOpposite(DirectionType.Left), DirectionType.Right);
        assert.equal(Direction.getOpposite(DirectionType.Right), DirectionType.Left);
        assert.equal(Direction.getOpposite(DirectionType.Up), DirectionType.Down);
        assert.equal(Direction.getOpposite(DirectionType.Down), DirectionType.Up);
    });

    it('should correctly classify horizontal vs vertical axes', () => {
        assert.equal(Direction.isHorizontal(DirectionType.Left), true);
        assert.equal(Direction.isHorizontal(DirectionType.Right), true);
        assert.equal(Direction.isHorizontal(DirectionType.Up), false);

        assert.equal(Direction.isVertical(DirectionType.Up), true);
        assert.equal(Direction.isVertical(DirectionType.Down), true);
        assert.equal(Direction.isVertical(DirectionType.Left), false);
    });
});
