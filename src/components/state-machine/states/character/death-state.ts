import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { CHARACTER_ANIMATIONS } from '../../../../common/assets';
import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { HeldGameObjectComponent } from '../../../game-object/held-game-object-component';
import { ThrowableObjectComponent } from '../../../game-object/throwable-object-component';

export class DeathState extends BaseCharacterState {
  #onDieCallback: () => void;

  constructor(gameObject: CharacterGameObject, onDieCallback: () => void = () => undefined) {
    super(CHARACTER_STATES.DEATH_STATE, gameObject);
    this.#onDieCallback = onDieCallback;
  }

  public onEnter(): void {
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

    // make character invulnerable after taking a hit
    this._gameObject.invulnerableComponent.invulnerable = true;

    // disable body on game object so we stop triggering the collision
    (this._gameObject.body as Phaser.Physics.Arcade.Body).enable = false;

    // play animation for character dying
    this._gameObject.animationComponent.playAnimation(CHARACTER_ANIMATIONS.DIE_DOWN, () => {
      this.#triggerDefeatedEvent();
    });
  }

  #triggerDefeatedEvent(): void {
    this._gameObject.disableObject();
    this.#onDieCallback();
  }
}
