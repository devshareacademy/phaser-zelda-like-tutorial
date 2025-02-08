import { CHARACTER_ANIMATIONS } from './assets';

export type CharacterAnimation = keyof typeof CHARACTER_ANIMATIONS;

export type Position = {
  x: number;
  y: number;
};
