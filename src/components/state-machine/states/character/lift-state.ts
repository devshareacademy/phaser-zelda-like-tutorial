import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { HeldGameObjectComponent } from '../../../game-object/held-game-object-component';
import { GameObject } from '../../../../common/types';

export class LiftState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.LIFT_STATE, gameObject);
  }

  public onEnter(args: unknown[]): void {
    const gameObjectBeingPickedUp = args[0] as GameObject;

    // reset game object velocity
    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    const heldComponent = HeldGameObjectComponent.getComponent<HeldGameObjectComponent>(this._gameObject);
    if (heldComponent === undefined) {
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
      return;
    }

    // store a reference to the lifted up game object
    heldComponent.object = gameObjectBeingPickedUp;

    // disable body on the lifted up game object
    if (isArcadePhysicsBody(gameObjectBeingPickedUp.body)) {
      gameObjectBeingPickedUp.body.enable = false;
    }

    // have character carry the object
    gameObjectBeingPickedUp.setDepth(2).setOrigin(0.5, 0.5);

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
