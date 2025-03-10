import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../../common/assets';
import { CustomGameObject, Position } from '../../common/types';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';
import { INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { ThrowableObjectComponent } from '../../components/game-object/throwable-object-component';

type PotConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Pot extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  #position: Position;

  constructor(config: PotConfig) {
    const { scene, position } = config;
    super(scene, position.x, position.y, ASSET_KEYS.POT, 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    // keep track of original position for the pot
    this.#position = { x: position.x, y: position.y };

    // add components
    new InteractiveObjectComponent(this, INTERACTIVE_OBJECT_TYPE.PICKUP);
    new ThrowableObjectComponent(this, () => {
      this.break();
    });
  }

  public disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    // make not visible until player re-enters room
    this.active = false;
    this.visible = false;
  }

  public enableObject(): void {
    // enable body on game object so we trigger the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    // make visible to the player
    this.active = true;
    this.visible = true;
  }

  public break(): void {
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.setTexture(ASSET_KEYS.POT_BREAK, 0).play(ASSET_KEYS.POT_BREAK);
    // once animation is finished, disable object and reset the initial texture
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + ASSET_KEYS.POT_BREAK, () => {
      this.setTexture(ASSET_KEYS.POT, 0);
      this.disableObject();
    });
  }
}
