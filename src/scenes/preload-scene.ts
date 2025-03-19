import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';
import { LevelData } from '../common/types';
import { LEVEL_NAME } from '../common/common';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  public preload(): void {
    // load asset pack that has assets for the rest of the game
    this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');
  }

  public create(): void {
    this.#createAnimations();

    // TODO: this will ned to come from our data manager
    const sceneData: LevelData = {
      level: LEVEL_NAME.DUNGEON_1,
      roomId: 1,
      doorId: 1,
    };
    this.scene.start(SCENE_KEYS.GAME_SCENE, sceneData);
  }

  #createAnimations(): void {
    this.anims.createFromAseprite(ASSET_KEYS.PLAYER);
    this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
    this.anims.createFromAseprite(ASSET_KEYS.WISP);
    this.anims.create({
      key: ASSET_KEYS.ENEMY_DEATH,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.ENEMY_DEATH),
      frameRate: 6,
      repeat: 0,
      delay: 0,
    });
    this.anims.create({
      key: ASSET_KEYS.POT_BREAK,
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.POT_BREAK),
      frameRate: 6,
      repeat: 0,
      delay: 0,
      hideOnComplete: true,
    });
  }
}
