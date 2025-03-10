import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { BaseMoveState } from './base-move-state';
import { CHARACTER_STATES } from './character-states';

export class MoveHoldingState extends BaseMoveState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_HOLDING_STATE, gameObject, 'WALK_HOLD');
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if action key was pressed, throw item
    if (controls.isActionKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // if no input is provided transition back to idle state
    if (this.isNoInputMovement(controls)) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_HOLDING_STATE);
      return;
    }

    // handle character movement
    this.handleCharacterMovement();
  }
}
