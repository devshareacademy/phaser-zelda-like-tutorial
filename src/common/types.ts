import * as Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from './assets';
import { CHEST_STATE, DIRECTION, INTERACTIVE_OBJECT_TYPE, LEVEL_NAME } from './common';

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type Position = {
  x: number;
  y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type Direction = keyof typeof DIRECTION;

export type ChestState = keyof typeof CHEST_STATE;

export type InteractiveObjectType = keyof typeof INTERACTIVE_OBJECT_TYPE;

export interface CustomGameObject {
  enableObject(): void;
  disableObject(): void;
}

export type LevelName = keyof typeof LEVEL_NAME;

export type LevelData = {
  level: LevelName;
  doorId: number;
  roomId: number;
};
