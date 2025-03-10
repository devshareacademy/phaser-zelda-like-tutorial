import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { Chest } from '../../../../game-objects/objects/chest';
import { isArcadePhysicsBody } from '../../../../common/utils';
import { CUSTOM_EVENTS, EVENT_BUS } from '../../../../common/event-bus';

export class OpenChestState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.OPEN_CHEST_STATE, gameObject);
  }

  onEnter(args: unknown[]): void {
    const chest = args[0] as Chest;

    // reset game object velocity
    if (isArcadePhysicsBody(this._gameObject.body)) {
      this._gameObject.body.velocity.x = 0;
      this._gameObject.body.velocity.y = 0;
    }

    // play lift animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`LIFT_${this._gameObject.direction}`, () => {
      // emit event data regarding chest
      EVENT_BUS.emit(CUSTOM_EVENTS.OPENED_CHEST, chest);
      // TODO: after showing message to player, transition to idle state
      this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    });
  }
}
