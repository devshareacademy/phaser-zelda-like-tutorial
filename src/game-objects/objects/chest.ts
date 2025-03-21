import * as Phaser from 'phaser';
import { ASSET_KEYS, CHEST_FRAME_KEYS } from '../../common/assets';
import { CHEST_STATE, INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { ChestState, Position } from '../../common/types';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';

type ChestConfig = {
  scene: Phaser.Scene;
  position: Position;
  requiresBossKey: boolean;
  chestState?: ChestState;
};

export class Chest extends Phaser.Physics.Arcade.Image {
  #state: ChestState;
  #isBossKeyChest: boolean;

  constructor(config: ChestConfig) {
    const { scene, position } = config;
    const frameKey = config.requiresBossKey ? CHEST_FRAME_KEYS.BIG_CHEST_CLOSED : CHEST_FRAME_KEYS.SMALL_CHEST_CLOSED;
    super(scene, position.x, position.y, ASSET_KEYS.DUNGEON_OBJECTS, frameKey);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#state = config.chestState || CHEST_STATE.HIDDEN;
    this.#isBossKeyChest = config.requiresBossKey;

    if (this.#isBossKeyChest) {
      (this.body as Phaser.Physics.Arcade.Body).setSize(32, 24).setOffset(0, 8);
    }

    // add components
    new InteractiveObjectComponent(
      this,
      INTERACTIVE_OBJECT_TYPE.OPEN,
      () => {
        // if this is a small chest, then the player can open
        if (!this.#isBossKeyChest) {
          return true;
        }
        // TODO: if boss chest, make sure player has the key to open the chest
        return false;
      },
      () => {
        this.open();
      },
    );
  }

  public open(): void {
    if (this.#state !== CHEST_STATE.REVEALED) {
      return;
    }

    this.#state = CHEST_STATE.OPEN;
    const frameKey = this.#isBossKeyChest ? CHEST_FRAME_KEYS.BIG_CHEST_OPEN : CHEST_FRAME_KEYS.SMALL_CHEST_OPEN;
    this.setFrame(frameKey);

    // after we open the chest, we can no longer interact with it
    InteractiveObjectComponent.removeComponent(this);
  }
}
