import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { DIRECTION } from '../../../../common/common';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { exhaustiveGuard, isArcadePhysicsBody } from '../../../../common/utils';
import { Direction } from '../../../../common/types';
import { HURT_PUSH_BACK_DELAY } from '../../../../common/config';
import { CHARACTER_ANIMATIONS } from '../../../../common/assets';
import { HeldGameObjectComponent } from '../../../game-object/held-game-object-component';
import { ThrowableObjectComponent } from '../../../game-object/throwable-object-component';

export class HurtState extends BaseCharacterState {
  #hurtPushBackSpeed: number;
  #onHurtCallback: () => void;
  #nextState: string;

  constructor(
    gameObject: CharacterGameObject,
    hurtPushBackSpeed: number,
    onHurtCallback: () => void = () => undefined,
    nextState: string = CHARACTER_STATES.IDLE_STATE,
  ) {
    super(CHARACTER_STATES.HURT_STATE, gameObject);
    this.#hurtPushBackSpeed = hurtPushBackSpeed;
    this.#onHurtCallback = onHurtCallback;
    this.#nextState = nextState;
  }

  public onEnter(args: unknown[]): void {
    const attackDirection = args[0] as Direction;

    // reset game object velocity
    this._resetObjectVelocity();

    const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject);
    if (heldComponent !== undefined && heldComponent.object !== undefined) {
      const throwObjectComponent = ThrowableObjectComponent.getComponent<ThrowableObjectComponent>(
        heldComponent.object,
      );
      if (throwObjectComponent !== undefined) {
        throwObjectComponent.drop();
      }
      heldComponent.drop();
    }

    if (isArcadePhysicsBody(this._gameObject.body)) {
      const body = this._gameObject.body;

      switch (attackDirection) {
        case DIRECTION.DOWN:
          body.velocity.y = this.#hurtPushBackSpeed;
          break;
        case DIRECTION.UP:
          body.velocity.y = this.#hurtPushBackSpeed * -1;
          break;
        case DIRECTION.LEFT:
          body.velocity.x = this.#hurtPushBackSpeed * -1;
          break;
        case DIRECTION.RIGHT:
          body.velocity.x = this.#hurtPushBackSpeed;
          break;
        default:
          exhaustiveGuard(attackDirection);
      }

      // wait a certain amount of time before resetting velocity to stop the push back
      this._gameObject.scene.time.delayedCall(HURT_PUSH_BACK_DELAY, () => {
        this._resetObjectVelocity();
      });
    }

    // make character invulnerable after taking a hit
    this._gameObject.invulnerableComponent.invulnerable = true;
    // call callback so we can do custom animations if provided
    this.#onHurtCallback();

    // play animation for character being hurt
    this._gameObject.animationComponent.playAnimation(CHARACTER_ANIMATIONS.HURT_DOWN, () => {
      this.#transition();
    });
  }

  #transition(): void {
    // wait set amount of time before making character vulnerable again
    this._gameObject.scene.time.delayedCall(
      this._gameObject.invulnerableComponent.invulnerableAfterHitAnimationDuration,
      () => {
        this._gameObject.invulnerableComponent.invulnerable = false;
      },
    );
    this._stateMachine.setState(this.#nextState);
  }
}
