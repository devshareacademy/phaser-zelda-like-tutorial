import * as Phaser from 'phaser';
import { CHARACTER_ANIMATIONS } from './assets';
import { CHEST_STATE, DIRECTION } from './common';

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type Position = {
  x: number;
  y: number;
};

export type GameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

export type Direction = keyof typeof DIRECTION;

export type ChestState = keyof typeof CHEST_STATE;
