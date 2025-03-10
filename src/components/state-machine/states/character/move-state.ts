import { INTERACTIVE_OBJECT_TYPE } from '../../../../common/common';
import { CHARACTER_STATES } from './character-states';
import { exhaustiveGuard } from '../../../../common/utils';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { CollidingObjectsComponent } from '../../../game-object/colliding-objects-component';
import { InteractiveObjectComponent } from '../../../game-object/interactive-object-component';
import { InputComponent } from '../../../input/input-component';
import { BaseMoveState } from './base-move-state';

export class MoveState extends BaseMoveState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.MOVE_STATE, gameObject, 'WALK');
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    // if no input is provided transition back to idle state
    if (this.isNoInputMovement(controls)) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // if we interacted with an object and switched states, stop processing
    if (this.#checkIfObjectWasInteractedWith(controls)) {
      return;
    }

    // handle character movement
    this.handleCharacterMovement();
  }

  #checkIfObjectWasInteractedWith(controls: InputComponent): boolean {
    const collideComponent = CollidingObjectsComponent.getComponent<CollidingObjectsComponent>(this._gameObject);
    if (collideComponent === undefined || collideComponent.objects.length === 0) {
      return false;
    }

    const collisionObject = collideComponent.objects[0];
    const interactiveObjectComponent =
      InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(collisionObject);
    if (interactiveObjectComponent === undefined) {
      return false;
    }

    if (!controls.isActionKeyJustDown) {
      return false;
    }

    // we can carry this item
    if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.PICKUP) {
      this._stateMachine.setState(CHARACTER_STATES.LIFT_STATE);
      return true;
    }

    // we can open this item
    if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.OPEN) {
      this._stateMachine.setState(CHARACTER_STATES.OPEN_CHEST_STATE);
      return true;
    }

    if (interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.AUTO) {
      return false;
    }

    // we should never hit this code block
    exhaustiveGuard(interactiveObjectComponent.objectType);
  }
}
