export const TILED_ROOM_OBJECT_PROPERTY = {
  ID: 'id',
} as const;

export const TILED_LAYER_NAMES = {
  ROOMS: 'rooms',
  SWITCHES: 'switches',
  POTS: 'pots',
  DOORS: 'doors',
  CHESTS: 'chests',
  ENEMIES: 'enemies',
  COLLISION: 'collision',
  ENEMY_COLLISION: 'enemy_collision',
} as const;

export const TILED_TILESET_NAMES = {
  COLLISION: 'collision',
} as const;

export const DOOR_TYPE = {
  OPEN: 'OPEN',
  LOCK: 'LOCK',
  TRAP: 'TRAP',
  BOSS: 'BOSS',
  OPEN_ENTRANCE: 'OPEN_ENTRANCE',
} as const;

export const TRAP_TYPE = {
  NONE: 'NONE',
  ENEMIES_DEFEATED: 'ENEMIES_DEFEATED',
  SWITCH: 'SWITCH',
} as const;

export const TILED_DOOR_OBJECT_PROPERTY = {
  TARGET_DOOR_ID: 'targetDoorId',
  TARGET_ROOM_ID: 'targetRoomId',
  TARGET_LEVEL: 'targetLevel',
  ID: 'id',
  DIRECTION: 'direction',
  DOOR_TYPE: 'doorType',
  TRAP_DOOR_TRIGGER: 'trapDoorTrigger',
  IS_LEVEL_TRANSITION: 'isLevelTransition',
} as const;

export const CHEST_REWARD = {
  SMALL_KEY: 'SMALL_KEY',
  BOSS_KEY: 'BOSS_KEY',
  MAP: 'MAP',
  COMPASS: 'COMPASS',
  NOTHING: 'NOTHING',
} as const;

export const TILED_CHEST_OBJECT_PROPERTY = {
  CONTENTS: 'contents',
  ID: 'id',
  REVEAL_CHEST_TRIGGER: 'revealChestTrigger',
  REQUIRES_BOSS_KEY: 'requiresBossKey',
} as const;

export const TILED_SWITCH_OBJECT_PROPERTY = {
  TARGET_IDS: 'targetIds',
  ACTION: 'action',
  TEXTURE: 'texture',
} as const;

export const SWITCH_TEXTURE = {
  PLATE: 'PLATE',
  FLOOR: 'FLOOR',
} as const;

export const SWITCH_ACTION = {
  NOTHING: 'NOTHING',
  OPEN_DOOR: 'OPEN_DOOR',
  REVEAL_CHEST: 'REVEAL_CHEST',
  REVEAL_KEY: 'REVEAL_KEY',
} as const;
