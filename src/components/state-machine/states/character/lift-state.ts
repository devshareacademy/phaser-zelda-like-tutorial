import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { isArcadePhysicsBody } from '../../../../common/utils';

export class LiftState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.LIFT_STATE, gameObject);
  }

  public onEnter(): void {
    // reset game object velocity
    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    // play lift animation and then transition to hold item state
    this._gameObject.animationComponent.playAnimation(`LIFT_${this._gameObject.direction}`);
  }

  public onUpdate(): void {
    if (this._gameObject.animationComponent.isAnimationPlaying()) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_HOLDING_STATE);
  }
}
