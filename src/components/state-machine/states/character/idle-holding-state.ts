import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';

export class IdleHoldingState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_HOLDING_STATE, gameObject);
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_HOLD_${this._gameObject.direction}`);

    // reset game object velocity
    this._resetObjectVelocity();
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if action key was pressed, throw item
    if (controls.isActionKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.THROW_STATE);
      return;
    }

    // if no other input is provided, do nothing
    if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_HOLDING_STATE);
  }
}
