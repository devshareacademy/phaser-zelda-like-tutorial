import * as Phaser from 'phaser';
import { DIRECTION, LEVEL_NAME } from './common';
import { CustomGameObject, Direction, GameObject, LevelName, Position } from './types';

/**
 * Utility function to ensure we handle the full possible range of types when checking a variable for a possible
 * type in a union.
 *
 * A good example of this is when we check for all of the possible values in a `switch` statement, and we want
 * to ensure we check for all possible values in an enum type object.
 */
export function exhaustiveGuard(_value: never): never {
  throw new Error(`Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}

export function isArcadePhysicsBody(
  body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | MatterJS.BodyType | null,
): body is Phaser.Physics.Arcade.Body {
  if (body === undefined || body === null) {
    return false;
  }
  return body instanceof Phaser.Physics.Arcade.Body;
}

export function isDirection(direction: string): direction is Direction {
  return DIRECTION[direction] !== undefined;
}

export function isCustomGameObject(gameObject: GameObject): gameObject is GameObject & CustomGameObject {
  return gameObject['disableObject'] !== undefined && gameObject['enableObject'] !== undefined;
}

export function getDirectionOfObjectFromAnotherObject(object: Position, targetObject: Position): Direction {
  if (object.y < targetObject.y) {
    return DIRECTION.DOWN;
  }
  if (object.y > targetObject.y) {
    return DIRECTION.UP;
  }
  if (object.x < targetObject.x) {
    return DIRECTION.RIGHT;
  }
  return DIRECTION.LEFT;
}

export function isLevelName(levelName: string): levelName is LevelName {
  return LEVEL_NAME[levelName] !== undefined;
}
