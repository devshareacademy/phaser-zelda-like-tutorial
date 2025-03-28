import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/enemies/spider';
import { Wisp } from '../game-objects/enemies/wisp';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { DIRECTION } from '../common/common';
import * as CONFIG from '../common/config';
import { Pot } from '../game-objects/objects/pot';
import { Chest } from '../game-objects/objects/chest';
import { GameObject, LevelData } from '../common/types';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import {
  exhaustiveGuard,
  getDirectionOfObjectFromAnotherObject,
  isArcadePhysicsBody,
  isLevelName,
} from '../common/utils';
import { TiledRoomObject } from '../common/tiled/types';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import {
  getAllLayerNamesWithPrefix,
  getTiledChestObjectsFromMap,
  getTiledDoorObjectsFromMap,
  getTiledEnemyObjectsFromMap,
  getTiledPotObjectsFromMap,
  getTiledRoomObjectsFromMap,
  getTiledSwitchObjectsFromMap,
} from '../common/tiled/tiled-utils';
import { Door } from '../game-objects/objects/door';

export class GameScene extends Phaser.Scene {
  #levelData!: LevelData;
  #controls!: KeyboardComponent;
  #player!: Player;
  #enemyGroup!: Phaser.GameObjects.Group;
  #blockingGroup!: Phaser.GameObjects.Group;
  #potGameObjects!: Pot[];
  #objectsByRoomId!: {
    [key: number]: {
      chestMap: { [key: number]: Chest };
      doorMap: { [key: number]: Door };
      doors: Door[];
      switches: unknown[];
      pots: Pot[];
      chests: Chest[];
      enemyGroup?: Phaser.GameObjects.Group;
      room: TiledRoomObject;
    };
  };
  #collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #enemyCollisionLayer!: Phaser.Tilemaps.TilemapLayer;
  #doorTransitionGroup!: Phaser.GameObjects.Group;
  #currentRoomId!: number;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  public init(data: LevelData): void {
    this.#levelData = data;
    this.#currentRoomId = data.roomId;
  }

  public create(): void {
    if (!this.input.keyboard) {
      console.warn('Phaser keyboard plugin is not setup properly.');
      return;
    }
    this.#controls = new KeyboardComponent(this.input.keyboard);

    this.#createLevel();
    if (this.#collisionLayer === undefined || this.#enemyCollisionLayer === undefined) {
      console.warn('Missing required collision layers for game.');
      return;
    }

    this.#setupPlayer();
    this.#setupCamera();

    this.#tempCode();

    this.#registerColliders();
    this.#registerCustomEvents();
  }

  #registerColliders(): void {
    // register collisions between enemies and current "room"
    this.#enemyGroup.getChildren().forEach((enemy) => {
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.setCollideWorldBounds(true);
    });

    // register collisions between player and enemies
    this.physics.add.overlap(this.#player, this.#enemyGroup, (player, enemy) => {
      this.#player.hit(DIRECTION.DOWN, 1);
      const enemyGameObject = enemy as CharacterGameObject;
      enemyGameObject.hit(this.#player.direction, 1);
    });

    // register collisions between player and blocking game objects (doors, pots, chests, etc.)
    this.physics.add.collider(this.#player, this.#blockingGroup, (player, gameObject) => {
      // add game object to players collision list
      this.#player.collidedWithGameObject(gameObject as GameObject);
    });

    // collision between player and game objects in the dungeon/room/world
    this.physics.add.overlap(this.#player, this.#doorTransitionGroup, (playerObj, doorObj) => {
      this.#handleRoomTransition(doorObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
    });

    // register collisions between enemies and blocking game objects (doors, pots, chests, etc.)
    this.physics.add.collider(
      this.#enemyGroup,
      this.#blockingGroup,
      (enemy, gameObject) => {
        // handle when pot objects are thrown at enemies
        if (
          gameObject instanceof Pot &&
          isArcadePhysicsBody(gameObject.body) &&
          (gameObject.body.velocity.x !== 0 || gameObject.body.velocity.y !== 0)
        ) {
          const enemyGameObject = enemy as CharacterGameObject;
          if (enemyGameObject instanceof CharacterGameObject) {
            enemyGameObject.hit(this.#player.direction, 1);
            gameObject.break();
          }
        }
      },
      // handle when objects are thrown on wisps, ignore collisions and let object move through
      (enemy, gameObject) => {
        const body = (gameObject as unknown as GameObject).body;
        if (enemy instanceof Wisp && isArcadePhysicsBody(body) && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
          return false;
        }
        return true;
      },
    );

    // handle collisions between thrown pots and other objects in the current room
    if (this.#potGameObjects.length > 0) {
      this.physics.add.collider(this.#potGameObjects, this.#blockingGroup, (pot) => {
        if (!(pot instanceof Pot)) {
          return;
        }
        pot.break();
      });
    }

    // collision between player and map walls
    this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
    this.physics.add.collider(this.#player, this.#collisionLayer);

    // collide with walls, doors, etc
    this.#enemyCollisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
    this.physics.add.collider(this.#enemyGroup, this.#enemyCollisionLayer);
  }

  #registerCustomEvents(): void {
    EVENT_BUS.on(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EVENT_BUS.off(CUSTOM_EVENTS.OPENED_CHEST, this.#handleOpenChest, this);
    });
  }

  #handleOpenChest(chest: Chest): void {
    console.log('chest opened');

    // TODO
  }

  #createLevel(): void {
    // create main background
    this.add.image(0, 0, ASSET_KEYS[`${this.#levelData.level}_BACKGROUND`], 0).setOrigin(0);
    // create main foreground
    this.add.image(0, 0, ASSET_KEYS[`${this.#levelData.level}_FOREGROUND`], 0).setOrigin(0).setDepth(2);

    // create tilemap from Tiled json data
    const map = this.make.tilemap({
      key: ASSET_KEYS[`${this.#levelData.level}_LEVEL`],
    });

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);
    if (collisionTiles === null) {
      console.log(`encountered error while creating collision tiles from tiled`);
      return;
    }

    const collisionLayer = map.createLayer(TILED_LAYER_NAMES.COLLISION, collisionTiles, 0, 0);
    if (collisionLayer === null) {
      console.log(`encountered error while creating collision layer using data from tiled`);
      return;
    }
    this.#collisionLayer = collisionLayer;
    this.#collisionLayer.setDepth(2).setAlpha(CONFIG.DEBUG_COLLISION_ALPHA);

    const enemyCollisionLayer = map.createLayer(TILED_LAYER_NAMES.ENEMY_COLLISION, collisionTiles, 0, 0);
    if (enemyCollisionLayer === null) {
      console.log(`encountered error while creating enemy collision layer using data from tiled`);
      return;
    }
    this.#enemyCollisionLayer = enemyCollisionLayer;
    this.#enemyCollisionLayer.setDepth(2).setVisible(false);

    // initialize objects
    this.#objectsByRoomId = {};
    this.#doorTransitionGroup = this.add.group([]);

    // create game objects
    this.#createRooms(map, TILED_LAYER_NAMES.ROOMS);

    const rooms = getAllLayerNamesWithPrefix(map, TILED_LAYER_NAMES.ROOMS).map((layerName: string) => {
      return {
        name: layerName,
        roomId: parseInt(layerName.split('/')[1], 10),
      };
    });
    const switchLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.SWITCHES}`));
    const potLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.POTS}`));
    const doorLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.DOORS}`));
    const chestLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.CHESTS}`));
    const enemyLayerNames = rooms.filter((layer) => layer.name.endsWith(`/${TILED_LAYER_NAMES.ENEMIES}`));

    doorLayerNames.forEach((layer) => this.#createDoors(map, layer.name, layer.roomId));
    switchLayerNames.forEach((layer) => this.#createButtons(map, layer.name, layer.roomId));
    potLayerNames.forEach((layer) => this.#createPots(map, layer.name, layer.roomId));
    chestLayerNames.forEach((layer) => this.#createChests(map, layer.name, layer.roomId));
    enemyLayerNames.forEach((layer) => this.#createEnemies(map, layer.name, layer.roomId));
  }

  #setupCamera(): void {
    // updates for camera to stay with level
    const roomSize = this.#objectsByRoomId[this.#levelData.roomId].room;
    this.cameras.main.setBounds(roomSize.x, roomSize.y - roomSize.height, roomSize.width, roomSize.height);
    this.cameras.main.startFollow(this.#player);
  }

  #setupPlayer(): void {
    const startingDoor = this.#objectsByRoomId[this.#levelData.roomId].doorMap[this.#levelData.doorId];
    const playerStartPosition = {
      x: startingDoor.x + startingDoor.doorTransitionZone.width / 2,
      y: startingDoor.y - startingDoor.doorTransitionZone.height / 2,
    };
    switch (startingDoor.direction) {
      case DIRECTION.UP:
        playerStartPosition.y += 40;
        break;
      case DIRECTION.DOWN:
        playerStartPosition.y -= 40;
        break;
      case DIRECTION.LEFT:
        playerStartPosition.x += 40;
        break;
      case DIRECTION.RIGHT:
        playerStartPosition.x -= 40;
        break;
      default:
        exhaustiveGuard(startingDoor.direction);
    }

    this.#player = new Player({
      scene: this,
      position: { x: playerStartPosition.x, y: playerStartPosition.y },
      controls: this.#controls,
      maxLife: CONFIG.PLAYER_START_MAX_HEALTH,
      currentLife: CONFIG.PLAYER_START_MAX_HEALTH,
    });
  }

  #tempCode(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Game Scene', { fontFamily: ASSET_KEYS.FONT_PRESS_START_2P })
      .setOrigin(0.5);

    this.#enemyGroup = this.add.group(
      [
        new Spider({
          scene: this,
          position: { x: this.scale.width / 2, y: this.scale.height / 2 + 50 },
        }),
        new Wisp({
          scene: this,
          position: { x: this.scale.width / 2, y: this.scale.height / 2 - 50 },
        }),
      ],
      { runChildUpdate: true },
    );

    this.#potGameObjects = [];
    const pot = new Pot({
      scene: this,
      position: { x: this.scale.width / 2 + 90, y: this.scale.height / 2 },
    });
    this.#potGameObjects.push(pot);

    this.#blockingGroup = this.add.group([
      pot,
      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 },
        requiresBossKey: false,
      }),
      new Chest({
        scene: this,
        position: { x: this.scale.width / 2 - 90, y: this.scale.height / 2 - 80 },
        requiresBossKey: true,
      }),
    ]);
  }

  /**
   * Parses the Tiled Map data and creates the 'Room' game objects
   * from the rooms layer in Tiled. The `Room` object is how we group
   * the various game objects in our game.
   */
  #createRooms(map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    const validTiledObjects = getTiledRoomObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tiledObject) => {
      this.#objectsByRoomId[tiledObject.id] = {
        switches: [],
        pots: [],
        doors: [],
        chests: [],
        room: tiledObject,
        chestMap: {},
        doorMap: {},
      };
    });
  }

  /**
   * Parses the Tiled Map data and creates the 'Door' game objects
   * for transitions between the various rooms/caves/buildings/etc.
   */
  #createDoors(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTiledObjects = getTiledDoorObjectsFromMap(map, layerName);
    validTiledObjects.forEach((tileObject) => {
      const door = new Door(this, tileObject, roomId);
      this.#objectsByRoomId[roomId].doors.push(door);
      this.#objectsByRoomId[roomId].doorMap[tileObject.id] = door;
      this.#doorTransitionGroup.add(door.doorTransitionZone);
    });
  }

  /**
   * Parses the Tiled Map data and creates the 'Button' game objects
   * that players can interact with to open doors, reveal chests, etc.
   */
  #createButtons(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTiledObjects = getTiledSwitchObjectsFromMap(map, layerName);
    console.log(validTiledObjects);
  }

  /**
   * Parses the Tiled Map data and creates the 'Pot' game objects.
   */
  #createPots(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTiledObjects = getTiledPotObjectsFromMap(map, layerName);
    console.log(validTiledObjects);
  }

  /**
   * Parses the Tiled Map data and creates the 'Chest' game objects.
   */
  #createChests(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTiledObjects = getTiledChestObjectsFromMap(map, layerName);
    console.log(validTiledObjects);
  }

  /**
   * Parses the Tiled Map data and creates the various enemy game objects like 'Wisp' and 'Spider'.
   */
  #createEnemies(map: Phaser.Tilemaps.Tilemap, layerName: string, roomId: number): void {
    console.log(layerName, roomId);
    const validTiledObjects = getTiledEnemyObjectsFromMap(map, layerName);
    console.log(validTiledObjects);
  }

  #handleRoomTransition(doorTrigger: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    // lock player input until transition is finished
    this.#controls.isMovementLocked = true;

    const door = this.#objectsByRoomId[this.#currentRoomId].doorMap[doorTrigger.name] as Door;
    const modifiedLevelName = door.targetLevel.toUpperCase();
    if (isLevelName(modifiedLevelName)) {
      const sceneData: LevelData = {
        level: modifiedLevelName,
        roomId: door.targetRoomId,
        doorId: door.targetDoorId,
      };
      this.scene.start(SCENE_KEYS.GAME_SCENE, sceneData);
      return;
    }
    const targetDoor = this.#objectsByRoomId[door.targetRoomId].doorMap[door.targetDoorId];

    // disable body on game object so we stop triggering the collision
    door.disableObject();
    // disable body on target door so we don't trigger transition back to original room
    targetDoor.disableObject();

    // calculate the target door and direction so we can animate the player and camera properly
    const targetDirection = getDirectionOfObjectFromAnotherObject(door, targetDoor);
    const doorDistance = {
      x: Math.abs((door.doorTransitionZone.x - targetDoor.doorTransitionZone.x) / 2),
      y: Math.abs((door.doorTransitionZone.y - targetDoor.doorTransitionZone.y) / 2),
    };
    if (targetDirection === DIRECTION.UP) {
      doorDistance.y *= -1;
    }
    if (targetDirection === DIRECTION.LEFT) {
      doorDistance.x *= -1;
    }

    // animate player into hallway
    const playerTargetPosition = {
      x: door.x + door.doorTransitionZone.width / 2 + doorDistance.x,
      y: door.y - door.doorTransitionZone.height / 2 + doorDistance.y,
    };
    this.tweens.add({
      targets: this.#player,
      y: playerTargetPosition.y,
      x: playerTargetPosition.x,
      duration: CONFIG.ROOM_TRANSITION_PLAYER_INTO_HALL_DURATION,
      delay: CONFIG.ROOM_TRANSITION_PLAYER_INTO_HALL_DELAY,
    });

    // animate camera to the next room based on the door positions
    const roomSize = this.#objectsByRoomId[targetDoor.roomId].room;
    // reset camera bounds so we have a smooth transition
    this.cameras.main.setBounds(
      this.cameras.main.worldView.x,
      this.cameras.main.worldView.y,
      this.cameras.main.worldView.width,
      this.cameras.main.worldView.height,
    );
    this.cameras.main.stopFollow();
    const bounds = this.cameras.main.getBounds();
    this.tweens.add({
      targets: bounds,
      x: roomSize.x,
      y: roomSize.y - roomSize.height,
      duration: CONFIG.ROOM_TRANSITION_CAMERA_ANIMATION_DURATION,
      delay: CONFIG.ROOM_TRANSITION_CAMERA_ANIMATION_DELAY,
      onUpdate: () => {
        this.cameras.main.setBounds(bounds.x, bounds.y, roomSize.width, roomSize.height);
      },
    });

    // animate player into room
    const playerDistanceToMoveIntoRoom = {
      x: doorDistance.x * 2,
      y: doorDistance.y * 2,
    };
    if (targetDirection === DIRECTION.UP || targetDirection === DIRECTION.DOWN) {
      playerDistanceToMoveIntoRoom.y = Math.max(Math.abs(playerDistanceToMoveIntoRoom.y), 32);
      if (targetDirection === DIRECTION.UP) {
        playerDistanceToMoveIntoRoom.y *= -1;
      }
    } else {
      playerDistanceToMoveIntoRoom.x = Math.max(Math.abs(playerDistanceToMoveIntoRoom.x), 32);
      if (targetDirection === DIRECTION.LEFT) {
        playerDistanceToMoveIntoRoom.x *= -1;
      }
    }

    this.tweens.add({
      targets: this.#player,
      y: playerTargetPosition.y + playerDistanceToMoveIntoRoom.y,
      x: playerTargetPosition.x + playerDistanceToMoveIntoRoom.x,
      duration: CONFIG.ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DURATION,
      delay: CONFIG.ROOM_TRANSITION_PLAYER_INTO_NEXT_ROOM_DELAY,
      onComplete: () => {
        // re-enable the door object player just entered through
        targetDoor.enableObject();
        // disable objects in previous room and repopulate this room if needed
        this.#currentRoomId = targetDoor.roomId;
        // update camera to follow player again
        this.cameras.main.startFollow(this.#player);
        // re-enable player input
        this.#controls.isMovementLocked = false;
      },
    });
  }
}
