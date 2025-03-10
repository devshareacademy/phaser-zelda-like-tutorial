import * as Phaser from 'phaser';
import { ASSET_KEYS } from '../../common/assets';
import { Position } from '../../common/types';

type PotConfig = {
  scene: Phaser.Scene;
  position: Position;
};

export class Pot extends Phaser.Physics.Arcade.Sprite {
  #position: Position;

  constructor(config: PotConfig) {
    const { scene, position } = config;
    super(scene, position.x, position.y, ASSET_KEYS.POT, 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 1).setImmovable(true);

    this.#position = { x: position.x, y: position.y };
  }
}
