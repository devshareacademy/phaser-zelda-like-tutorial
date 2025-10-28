import { BaseCharacterState } from './base-character-state';
import { CHARACTER_STATES } from './character-states';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { HeldGameObjectComponent } from '../../../game-object/held-game-object-component';
import { ThrowableObjectComponent } from '../../../game-object/throwable-object-component';
import { InteractiveObjectComponent } from '../../../game-object/interactive-object-component';
import { INTERACTIVE_OBJECT_TYPE } from '../../../../common/common';

export class IdleState extends BaseCharacterState {
  constructor(gameObject: CharacterGameObject) {
    super(CHARACTER_STATES.IDLE_STATE, gameObject);
  }

  public onEnter(): void {
    // play idle animation based on game object direction
    this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

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
  }

  public onUpdate(): void {
    const controls = this._gameObject.controls;

    if (controls.isMovementLocked) {
      return;
    }

    // if attack key was pressed, attack with weapon
    if (controls.isAttackKeyJustDown) {
      this._stateMachine.setState(CHARACTER_STATES.ATTACK_STATE);
      return;
    }

    // Use actionZone to detect objects in front of the player
    const player = this._gameObject as any;
    if (player.actionZone && controls.isActionKeyJustDown) {
      const overlapping: Phaser.GameObjects.GameObject[] = [];
      this._gameObject.scene.physics.overlap(player.actionZone, this._gameObject.scene.children.list, (zone, obj) => {
        if (
          obj instanceof Phaser.GameObjects.Sprite ||
          obj instanceof Phaser.GameObjects.Image
        ) {
          overlapping.push(obj);
        }
      });

      for (const obj of overlapping) {
        const interactiveObjectComponent = InteractiveObjectComponent.getComponent<InteractiveObjectComponent>(obj as any);
        if (
          interactiveObjectComponent &&
          interactiveObjectComponent.objectType === INTERACTIVE_OBJECT_TYPE.PICKUP &&
          interactiveObjectComponent.canInteractWith()
        ) {
          interactiveObjectComponent.interact();
          this._stateMachine.setState(CHARACTER_STATES.LIFT_STATE, obj);
          return;
        }
      }
    }

    // if no other input is provided, do nothing
    if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
  }
}
