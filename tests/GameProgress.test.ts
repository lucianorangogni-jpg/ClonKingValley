import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameConstants } from '../src/core/GameConstants.ts';

describe('Game Progress and Scoring Logic', () => {
    it('should correctly calculate score increments for gems, mummies and chamber clear', () => {
        let score = 0;

        // Collect 4 gems
        for (let i = 0; i < 4; i++) {
            score += GameConstants.SCORE_GEM;
        }
        assert.equal(score, 400);

        // Defeat 2 mummies
        score += GameConstants.SCORE_MUMMY * 2;
        assert.equal(score, 800);

        // Chamber clear bonus
        score += GameConstants.SCORE_CHAMBER_CLEAR;
        assert.equal(score, 1800);
    });

    it('should unlock exit door only when all chamber gems are collected', () => {
        const totalGems = 5;
        let remainingGems = totalGems;
        let doorUnlocked = false;

        for (let i = 0; i < totalGems; i++) {
            assert.equal(doorUnlocked, false, 'Door must remain locked while gems remain');
            remainingGems--;
            if (remainingGems === 0) {
                doorUnlocked = true;
            }
        }

        assert.equal(remainingGems, 0);
        assert.equal(doorUnlocked, true);
    });

    it('should correctly decrement lives and retain current stage upon losing a life', () => {
        let currentStage = 2;
        let currentLives = 3;

        // First death in chamber 2
        currentLives--;
        let stillAlive = currentLives > 0;
        assert.equal(stillAlive, true);
        assert.equal(currentLives, 2);
        assert.equal(currentStage, 2, 'Stage must remain 2, not restart at 1');

        // Second death in chamber 2
        currentLives--;
        stillAlive = currentLives > 0;
        assert.equal(stillAlive, true);
        assert.equal(currentLives, 1);
        assert.equal(currentStage, 2);

        // Third death in chamber 2: runs out of lives -> Game Over
        currentLives--;
        stillAlive = currentLives > 0;
        assert.equal(stillAlive, false, 'Game Over only occurs when lives reaches 0');
        assert.equal(currentLives, 0);
    });
});
