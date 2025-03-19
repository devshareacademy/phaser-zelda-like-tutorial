import { Direction } from '../types';
import { CHEST_REWARD, DOOR_TYPE, SWITCH_ACTION, SWITCH_TEXTURE, TRAP_TYPE } from './common';

export type TiledObject = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TiledObjectProperty = {
  name: string;
  type: string;
  value: string | number | boolean;
};

export type TiledObjectWithProperties = {
  properties: TiledObjectProperty[];
} & TiledObject;

export type TiledRoomObject = {
  id: number;
} & TiledObject;

export type TiledDoorObject = {
  id: number;
  targetDoorId: number;
  isUnlocked: boolean;
  doorType: DoorType;
  direction: Direction;
  trapDoorTrigger: TrapType;
  isLevelTransition: boolean;
  targetLevel: string;
  targetRoomId: number;
} & TiledObject;

export type DoorType = keyof typeof DOOR_TYPE;

export type TrapType = keyof typeof TRAP_TYPE;

export type TiledPotObject = TiledObject;

export type TiledChestObject = {
  contents: ChestReward;
  id: number;
  revealChestTrigger: TrapType;
  requiresBossKey: boolean;
} & TiledObject;

export type ChestReward = keyof typeof CHEST_REWARD;

export type TiledEnemyObject = {
  type: number;
} & TiledObject;

export const TILED_ENEMY_OBJECT_PROPERTY = {
  TYPE: 'type',
} as const;

export type TiledSwitchObject = {
  targetIds: number[];
  action: SwitchAction;
  texture: SwitchTexture;
} & TiledObject;

export type SwitchTexture = keyof typeof SWITCH_TEXTURE;

export type SwitchAction = keyof typeof SWITCH_ACTION;
