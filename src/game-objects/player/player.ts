import * as Phaser from 'phaser';
import { Position } from '../../common/types';
import { PLAYER_ANIMATION_KEYS } from '../../common/assets';

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(config: PlayerConfig) {
    const { scene, position, assetKey, frame } = config;
    const { x, y } = position;
    super(scene, x, y, assetKey, frame || 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 });
  }
}
