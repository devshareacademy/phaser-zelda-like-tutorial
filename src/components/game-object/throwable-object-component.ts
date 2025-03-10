import { Direction, GameObject } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class ThrowableObjectComponent extends BaseGameObjectComponent {
  #callback: () => void;

  constructor(gameObject: GameObject, callback = () => undefined) {
    super(gameObject);
    this.#callback = callback;
  }

  public drop(): void {
    this.#callback();
  }

  public throw(direction: Direction): void {
    this.#callback();
  }
}
