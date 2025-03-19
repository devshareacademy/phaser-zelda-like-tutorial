import { DIRECTION } from '../../../../common/common';
import { Direction } from '../../../../common/types';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { InputComponent } from '../../../input/input-component';
import { BaseCharacterState } from './base-character-state';

export abstract class BaseMoveState extends BaseCharacterState {
  protected _moveAnimationPrefix: 'WALK' | 'WALK_HOLD';

  constructor(stateName: string, gameObject: CharacterGameObject, moveAnimationPrefix: 'WALK' | 'WALK_HOLD') {
    super(stateName, gameObject);
    this._moveAnimationPrefix = moveAnimationPrefix;
  }

  protected isNoInputMovement(controls: InputComponent): boolean {
    return (
      (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) ||
      controls.isMovementLocked
    );
  }

  protected handleCharacterMovement(): void {
    const controls = this._gameObject.controls;

    // vertical movement
    if (controls.isUpDown) {
      this.updateVelocity(false, -1);
      this.updateDirection(DIRECTION.UP);
    } else if (controls.isDownDown) {
      this.updateVelocity(false, 1);
      this.updateDirection(DIRECTION.DOWN);
    } else {
      this.updateVelocity(false, 0);
    }

    const isMovingVertically = controls.isDownDown || controls.isUpDown;
    // horizontal movement
    if (controls.isLeftDown) {
      this.flip(true);
      this.updateVelocity(true, -1);
      if (!isMovingVertically) {
        this.updateDirection(DIRECTION.LEFT);
      }
    } else if (controls.isRightDown) {
      this.flip(false);
      this.updateVelocity(true, 1);
      if (!isMovingVertically) {
        this.updateDirection(DIRECTION.RIGHT);
      }
    } else {
      this.updateVelocity(true, 0);
    }

    this.normalizeVelocity();
  }

  protected normalizeVelocity(): void {
    // if the player is moving diagonally, the resultant vector will have a magnitude greater than the defined speed.
    // if we normalize the vector, this will make sure the magnitude matches defined speed
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
  }

  protected flip(value: boolean): void {
    this._gameObject.setFlipX(value);
  }

  protected updateVelocity(isX: boolean, value: number): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    if (isX) {
      this._gameObject.body.velocity.x = value;
      return;
    }
    this._gameObject.body.velocity.y = value;
  }

  protected updateDirection(direction: Direction): void {
    this._gameObject.direction = direction;
    this._gameObject.animationComponent.playAnimation(`${this._moveAnimationPrefix}_${this._gameObject.direction}`);
  }
}
