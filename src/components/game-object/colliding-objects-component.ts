import { GameObject } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class CollidingObjectsComponent extends BaseGameObjectComponent {
  #objects: GameObject[];

  constructor(gameObject: GameObject) {
    super(gameObject);
    this.#objects = [];
  }

  get objects(): GameObject[] {
    return this.#objects;
  }

  public add(gameObject: GameObject): void {
    this.#objects.push(gameObject);
  }

  public reset(): void {
    this.#objects = [];
  }
}
