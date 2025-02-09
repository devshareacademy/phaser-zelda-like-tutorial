import { DIRECTION } from '../../common/common';
import { Direction, GameObject } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class DirectionComponent extends BaseGameObjectComponent {
  #direction: Direction;
  #callback: (direction: Direction) => void;

  constructor(gameObject: GameObject, onDirectionCallback = () => undefined) {
    super(gameObject);
    this.#direction = DIRECTION.DOWN;
    this.#callback = onDirectionCallback;
  }

  get direction(): Direction {
    return this.#direction;
  }

  set direction(direction: Direction) {
    this.#direction = direction;
    this.#callback(this.#direction);
  }
}
