import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { HeldGameObjectComponent } from '../../../game-object/held-game-object-component';
import { ThrowableObjectComponent } from '../../../game-object/throwable-object-component';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';

export class ThrowState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.THROW_STATE, gameObject);
  }

  public onEnter(): void {
    // reset game object velocity
    this._resetObjectVelocity();

    // play lift animation to throw items
    this._gameObject.animationComponent.playAnimationInReverse(`LIFT_${this._gameObject.direction}`);

    // get item held by character and see if this is a throwable item
    const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject);
    if (heldComponent === undefined || heldComponent.object === undefined) {
      return;
    }
    const throwObjectComponent = ThrowableObjectComponent.getComponent<ThrowableObjectComponent>(heldComponent.object);
    if (throwObjectComponent !== undefined) {
      throwObjectComponent.throw(this._gameObject.direction);
    }
    heldComponent.drop();
  }

  public onUpdate(): void {
    if (this._gameObject.animationComponent.isAnimationPlaying()) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
  }
}
