import * as Phaser from 'phaser';
import { Direction, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import {
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN,
  ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT,
  ENEMY_SPIDER_HURT_PUSH_BACK_SPEED,
  ENEMY_SPIDER_MAX_HEALTH,
  ENEMY_SPIDER_SPEED,
} from '../../common/config';
import { AnimationConfig } from '../../components/game-object/animation-component';
import { ASSET_KEYS, SPIDER_ANIMATION_KEYS } from '../../common/assets';
import { CharacterGameObject } from '../common/character-game-object';
import { DIRECTION } from '../../common/common';
import { exhaustiveGuard } from '../../common/utils';
import { HurtState } from '../../components/state-machine/states/character/hurt-state';
import { DeathState } from '../../components/state-machine/states/character/death-state';

export type SpiderConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Spider extends CharacterGameObject {
  constructor(config: SpiderConfig) {
    // create animation config for component
    const animConfig = { key: SPIDER_ANIMATION_KEYS.WALK, repeat: -1, ignoreIfPlaying: true };
    const hurtAnimConfig = { key: SPIDER_ANIMATION_KEYS.HIT, repeat: 0, ignoreIfPlaying: true };
    const deathAnimConfig = { key: SPIDER_ANIMATION_KEYS.DEATH, repeat: 0, ignoreIfPlaying: true };
    const animationConfig: AnimationConfig = {
      WALK_DOWN: animConfig,
      WALK_UP: animConfig,
      WALK_LEFT: animConfig,
      WALK_RIGHT: animConfig,
      IDLE_DOWN: animConfig,
      IDLE_UP: animConfig,
      IDLE_LEFT: animConfig,
      IDLE_RIGHT: animConfig,
      HURT_DOWN: hurtAnimConfig,
      HURT_UP: hurtAnimConfig,
      HURT_LEFT: hurtAnimConfig,
      HURT_RIGHT: hurtAnimConfig,
      DIE_DOWN: deathAnimConfig,
      DIE_UP: deathAnimConfig,
      DIE_LEFT: deathAnimConfig,
      DIE_RIGHT: deathAnimConfig,
    };

    super({
      scene: config.scene,
      position: config.position,
      assetKey: ASSET_KEYS.SPIDER,
      frame: 0,
      id: `spider-${Phaser.Math.RND.uuid()}`,
      isPlayer: false,
      animationConfig,
      speed: ENEMY_SPIDER_SPEED,
      inputComponent: new InputComponent(),
      isInvulnerable: false,
      maxLife: ENEMY_SPIDER_MAX_HEALTH,
    });

    // add shared components
    this._directionComponent.callback = (direction: Direction) => {
      this.#handleDirectionChange(direction);
    };

    // add state machine
    this._stateMachine.addState(new IdleState(this));
    this._stateMachine.addState(new MoveState(this));
    this._stateMachine.addState(new HurtState(this, ENEMY_SPIDER_HURT_PUSH_BACK_SPEED));
    this._stateMachine.addState(new DeathState(this));
    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    // start simple ai movement pattern
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX),
      callback: this.#changeDirection,
      callbackScope: this,
      loop: false,
    });
  }

  #handleDirectionChange(direction: Direction): void {
    switch (direction) {
      case DIRECTION.DOWN:
        this.setAngle(0);
        return;
      case DIRECTION.UP:
        this.setAngle(180);
        return;
      case DIRECTION.LEFT:
        this.setAngle(90);
        return;
      case DIRECTION.RIGHT:
        this.setAngle(270);
        return;
      default:
        exhaustiveGuard(direction);
    }
  }

  #changeDirection(): void {
    // reset existing enemy input
    this.controls.reset();

    // wait a small period of time and then choose a random direction to move
    this.scene.time.delayedCall(ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_WAIT, () => {
      const randomDirection = Phaser.Math.Between(0, 3);
      if (randomDirection === 0) {
        this.controls.isUpDown = true;
      } else if (randomDirection === 1) {
        this.controls.isRightDown = true;
      } else if (randomDirection === 2) {
        this.controls.isDownDown = true;
      } else {
        this.controls.isLeftDown = true;
      }

      // set up event for next direction change
      this.scene.time.addEvent({
        delay: Phaser.Math.Between(ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MIN, ENEMY_SPIDER_CHANGE_DIRECTION_DELAY_MAX),
        callback: this.#changeDirection,
        callbackScope: this,
        loop: false,
      });
    });
  }
}
