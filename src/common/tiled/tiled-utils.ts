import * as Phaser from 'phaser';
import {
  ChestReward,
  DoorType,
  SwitchAction,
  SwitchTexture,
  TILED_ENEMY_OBJECT_PROPERTY,
  TiledChestObject,
  TiledDoorObject,
  TiledEnemyObject,
  TiledObjectProperty,
  TiledObjectWithProperties,
  TiledPotObject,
  TiledRoomObject,
  TiledSwitchObject,
  TrapType,
} from './types';
import {
  CHEST_REWARD,
  DOOR_TYPE,
  SWITCH_ACTION,
  SWITCH_TEXTURE,
  TILED_CHEST_OBJECT_PROPERTY,
  TILED_DOOR_OBJECT_PROPERTY,
  TILED_ROOM_OBJECT_PROPERTY,
  TILED_SWITCH_OBJECT_PROPERTY,
  TRAP_TYPE,
} from './common';
import { isDirection } from '../utils';
import { LevelName } from '../types';

/**
 * Validates that the provided property is of the type TiledObjectProperty.
 */
export function isTiledObjectProperty(property: unknown): property is TiledObjectProperty {
  if (typeof property !== 'object' || property === null || property === undefined) {
    return false;
  }
  return property['name'] !== undefined && property['type'] !== undefined && property['value'] !== undefined;
}

/**
 * Returns an array of validated TiledObjectProperty objects from the provided Phaser Tiled Object properties.
 */
export function getTiledProperties(properties: unknown): TiledObjectProperty[] {
  const validProperties: TiledObjectProperty[] = [];
  if (typeof properties !== 'object' || properties === null || properties === undefined || !Array.isArray(properties)) {
    return validProperties;
  }
  properties.forEach((property) => {
    if (!isTiledObjectProperty(property)) {
      return;
    }
    validProperties.push(property);
  });
  return validProperties;
}

/**
 * Returns the value of the given Tiled property name on an object. In Tiled the object properties are
 * stored on an array, and we need to loop through the Array to find the property we are looking for.
 */
export function getTiledPropertyByName<T>(properties: TiledObjectProperty[], propertyName: string): T | undefined {
  const tiledProperty = properties.find((prop) => {
    return prop.name === propertyName;
  });
  if (tiledProperty === undefined) {
    return undefined;
  }
  return tiledProperty.value as T;
}

/**
 * Finds all of the Tiled Objects for a given layer of a Tilemap, and filters to only objects that include
 * the basic properties for an objects position, width, and height.
 */
export function getTiledObjectsFromLayer(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledObjectWithProperties[] {
  const validTiledObjects: TiledObjectWithProperties[] = [];
  // get the Tiled object layer by its name
  const tiledObjectLayer = map.getObjectLayer(layerName);
  if (!tiledObjectLayer) {
    return validTiledObjects;
  }

  // loop through each object and validate object has basic properties for position, width, height, etc
  const tiledObjects = tiledObjectLayer.objects;
  tiledObjects.forEach((tiledObject) => {
    if (
      tiledObject.x === undefined ||
      tiledObject.y === undefined ||
      tiledObject.width === undefined ||
      tiledObject.height === undefined
    ) {
      return;
    }
    validTiledObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      properties: getTiledProperties(tiledObject.properties),
    });
  });

  return validTiledObjects;
}

/**
 * Finds all of the valid 'Room' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledRoomObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledRoomObject[] {
  const roomObjects: TiledRoomObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const id = getTiledPropertyByName<number>(tiledObject.properties, TILED_ROOM_OBJECT_PROPERTY.ID);
    if (id === undefined) {
      return;
    }

    roomObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      id,
    });
  });

  return roomObjects;
}

/**
 * Parses the provided Phaser Tilemap and returns all Object layer names with the provided prefix.
 * This function expects the layer names to be in a format like: rooms/1/enemies.
 */
export function getAllLayerNamesWithPrefix(map: Phaser.Tilemaps.Tilemap, prefix: string): string[] {
  return map
    .getObjectLayerNames()
    .filter((layerName) => layerName.startsWith(`${prefix}/`))
    .filter((layerName) => {
      const layerData = layerName.split('/');
      if (layerData.length !== 3) {
        return false;
      }
      return true;
    });
}

/**
 * Finds all of the valid 'Door' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledDoorObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledDoorObject[] {
  const doorObjects: TiledDoorObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const doorId = getTiledPropertyByName<number>(tiledObject.properties, TILED_DOOR_OBJECT_PROPERTY.ID);
    const targetDoorId = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.TARGET_DOOR_ID,
    );
    const doorDirection = getTiledPropertyByName<string>(tiledObject.properties, TILED_DOOR_OBJECT_PROPERTY.DIRECTION);
    const doorType = getTiledPropertyByName<string>(tiledObject.properties, TILED_DOOR_OBJECT_PROPERTY.DOOR_TYPE);
    const trapDoorType = getTiledPropertyByName<string>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.TRAP_DOOR_TRIGGER,
    );
    const isLevelTransition = getTiledPropertyByName<boolean>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.IS_LEVEL_TRANSITION,
    );
    const targetLevel = getTiledPropertyByName<LevelName>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.TARGET_LEVEL,
    );
    const targetRoomId = getTiledPropertyByName<number>(
      tiledObject.properties,
      TILED_DOOR_OBJECT_PROPERTY.TARGET_ROOM_ID,
    );
    if (
      doorId === undefined ||
      targetDoorId === undefined ||
      doorDirection === undefined ||
      doorType === undefined ||
      trapDoorType === undefined ||
      isLevelTransition === undefined ||
      targetLevel === undefined ||
      targetRoomId === undefined ||
      !isDirection(doorDirection) ||
      !isDoorType(doorType) ||
      !isTrapType(trapDoorType)
    ) {
      return;
    }

    doorObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      id: doorId,
      targetDoorId: targetDoorId,
      direction: doorDirection,
      doorType: doorType,
      trapDoorTrigger: trapDoorType,
      isLevelTransition,
      targetLevel,
      targetRoomId,
      isUnlocked: false,
    });
  });

  return doorObjects;
}

export function isDoorType(doorType: string): doorType is DoorType {
  return DOOR_TYPE[doorType] !== undefined;
}

export function isTrapType(trapType: string): trapType is TrapType {
  return TRAP_TYPE[trapType] !== undefined;
}

/**
 * Finds all of the valid 'Pot' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledPotObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledPotObject[] {
  const potObjects: TiledPotObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    potObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
    });
  });

  return potObjects;
}

/**
 * Finds all of the valid 'Chest' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledChestObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledChestObject[] {
  const chestObjects: TiledChestObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const contents = getTiledPropertyByName<ChestReward>(tiledObject.properties, TILED_CHEST_OBJECT_PROPERTY.CONTENTS);
    const id = getTiledPropertyByName<number>(tiledObject.properties, TILED_CHEST_OBJECT_PROPERTY.ID);
    const revealChestTrigger = getTiledPropertyByName<TrapType>(
      tiledObject.properties,
      TILED_CHEST_OBJECT_PROPERTY.REVEAL_CHEST_TRIGGER,
    );
    const requiresBossKey = getTiledPropertyByName<boolean>(
      tiledObject.properties,
      TILED_CHEST_OBJECT_PROPERTY.REQUIRES_BOSS_KEY,
    );
    if (
      contents === undefined ||
      id === undefined ||
      revealChestTrigger === undefined ||
      requiresBossKey === undefined ||
      !isTrapType(revealChestTrigger) ||
      !isChestReward(contents)
    ) {
      return;
    }

    chestObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      id,
      revealChestTrigger,
      contents,
      requiresBossKey,
    });
  });

  return chestObjects;
}

export function isChestReward(reward: string): reward is ChestReward {
  return CHEST_REWARD[reward] !== undefined;
}

/**
 * Finds all of the valid 'Enemy' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledEnemyObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledEnemyObject[] {
  const enemyObjects: TiledEnemyObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const enemyType = getTiledPropertyByName<number>(tiledObject.properties, TILED_ENEMY_OBJECT_PROPERTY.TYPE);
    if (enemyType === undefined) {
      return;
    }

    enemyObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      type: enemyType,
    });
  });

  return enemyObjects;
}

/**
 * Finds all of the valid 'Switch' Tiled Objects on a given layer of a Tilemap.
 */
export function getTiledSwitchObjectsFromMap(map: Phaser.Tilemaps.Tilemap, layerName: string): TiledSwitchObject[] {
  const switchObjects: TiledSwitchObject[] = [];

  // loop through each object and validate object has properties for the object we are planning to build
  const tiledObjects = getTiledObjectsFromLayer(map, layerName);
  tiledObjects.forEach((tiledObject) => {
    const action = getTiledPropertyByName<string>(tiledObject.properties, TILED_SWITCH_OBJECT_PROPERTY.ACTION);
    const targetIds = getTiledPropertyByName<string>(tiledObject.properties, TILED_SWITCH_OBJECT_PROPERTY.TARGET_IDS);
    const texture = getTiledPropertyByName<string>(tiledObject.properties, TILED_SWITCH_OBJECT_PROPERTY.TEXTURE);

    if (
      action === undefined ||
      targetIds === undefined ||
      texture === undefined ||
      !isSwitchAction(action) ||
      !isSwitchTexture(texture)
    ) {
      return;
    }

    switchObjects.push({
      x: tiledObject.x,
      y: tiledObject.y,
      width: tiledObject.width,
      height: tiledObject.height,
      action,
      targetIds: targetIds.split(',').map((value) => parseInt(value, 10)),
      texture,
    });
  });

  return switchObjects;
}

export function isSwitchTexture(switchTexture: string): switchTexture is SwitchTexture {
  return SWITCH_TEXTURE[switchTexture] !== undefined;
}

export function isSwitchAction(switchAction: string): switchAction is SwitchAction {
  return SWITCH_ACTION[switchAction] !== undefined;
}
