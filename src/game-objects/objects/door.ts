import { TiledDoorObject } from '../../common/tiled/types';
import { CustomGameObject, Direction } from '../../common/types';

export class Door implements CustomGameObject {
  #scene: Phaser.Scene;
  #roomId: number;
  #targetDoorId: number;
  #targetRoomId: number;
  #x: number;
  #y: number;
  #targetLevel: string;
  #doorTransitionZone: Phaser.GameObjects.Zone;
  #debugDoorTransitionZone: Phaser.GameObjects.Rectangle | undefined;
  #direction: Direction;

  constructor(scene: Phaser.Scene, config: TiledDoorObject, roomId: number) {
    this.#scene = scene;
    this.#roomId = roomId;
    this.#targetDoorId = config.targetDoorId;
    this.#targetRoomId = config.targetRoomId;
    this.#targetLevel = config.targetLevel;
    this.#x = config.x;
    this.#y = config.y;
    this.#direction = config.direction;

    // create door transition
    this.#doorTransitionZone = this.#scene.add
      .zone(config.x, config.y, config.width, config.height)
      .setOrigin(0, 1)
      .setName(config.id.toString(10));
    this.#scene.physics.world.enable(this.#doorTransitionZone);

    this.#debugDoorTransitionZone = scene.add
      .rectangle(
        this.#doorTransitionZone.x,
        this.#doorTransitionZone.y,
        this.#doorTransitionZone.width,
        this.#doorTransitionZone.height,
        0xffff00,
        0.6,
      )
      .setOrigin(0, 1);
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get roomId(): number {
    return this.#roomId;
  }

  get targetRoomId(): number {
    return this.#targetRoomId;
  }

  get targetDoorId(): number {
    return this.#targetDoorId;
  }

  get doorTransitionZone(): Phaser.GameObjects.Zone {
    return this.#doorTransitionZone;
  }

  get targetLevel(): string {
    return this.#targetLevel;
  }

  get direction(): Direction {
    return this.#direction;
  }

  public disableObject(): void {
    (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable = false;
    this.#doorTransitionZone.active = true;
  }

  public enableObject(): void {
    (this.#doorTransitionZone.body as Phaser.Physics.Arcade.Body).enable = true;
    this.#doorTransitionZone.active = true;
  }
}
