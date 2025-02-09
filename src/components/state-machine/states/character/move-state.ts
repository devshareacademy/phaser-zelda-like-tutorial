import { PLAYER_ANIMATION_KEYS } from '../../../../common/assets';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { Player } from '../../../../game-objects/player/player';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { Direction } from '../../../../common/types';
import { DIRECTION } from '../../../../common/common';

export class MoveState extends BaseCharacterState {
  constructor(gameObject: Player) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject);
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if no input is provided transition back to idle state
    if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // vertical movement
    if (controls.isUpDown) {
      this._gameObject.play({ key: PLAYER_ANIMATION_KEYS.WALK_UP, repeat: -1 }, true);
      this.#updateVelocity(false, -1);
      this.#updateDirection(DIRECTION.UP);
    } else if (controls.isDownDown) {
      this._gameObject.play({ key: PLAYER_ANIMATION_KEYS.WALK_DOWN, repeat: -1 }, true);
      this.#updateVelocity(false, 1);
      this.#updateDirection(DIRECTION.DOWN);
    } else {
      this.#updateVelocity(false, 0);
    }

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    // horizontal movement
    if (controls.isLeftDown) {
      this.#flip(true);
      this.#updateVelocity(true, -1);
      this.#updateDirection(DIRECTION.LEFT);
      if (!isMovingVertically) {
        this._gameObject.play({ key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1 }, true);
      }
    } else if (controls.isRightDown) {
      this.#flip(false);
      this.#updateVelocity(true, 1);
      this.#updateDirection(DIRECTION.RIGHT);
      if (!isMovingVertically) {
        this._gameObject.play({ key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1 }, true);
      }
    } else {
      this.#updateVelocity(true, 0);
    }

    this.#normalizeVelocity();
  }

  #flip(value: boolean): void {
    this._gameObject.setFlipX(value);
  }

  #updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    if (isX) {
      this._gameObject.body.velocity.x = value;
      return;
    }
    this._gameObject.body.velocity.y = value;
  }

  #normalizeVelocity(): void {
    // if the player is moving diagonally, the resultant vector will have a magnitude greater than the defined speed.
    // if we normalize the vector, this will make sure the magnitude matches defined speed
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
  }

  #updateDirection(direction: Direction): void {
    this._gameObject.direction = direction;
  }
}
