import { GameObject, InteractiveObjectType } from '../../common/types';
import { BaseGameObjectComponent } from './base-game-object-component';

export class InteractiveObjectComponent extends BaseGameObjectComponent {
  #objectType: InteractiveObjectType;
  #callback: () => void;
  #canInteractCheck: () => boolean;

  constructor(
    gameObject: GameObject,
    objectType: InteractiveObjectType,
    canInteractCheck = () => true,
    callback = () => undefined,
  ) {
    super(gameObject);
    this.#objectType = objectType;
    this.#callback = callback;
    this.#canInteractCheck = canInteractCheck;
  }

  get objectType(): InteractiveObjectType {
    return this.#objectType;
  }

  public interact(): void {
    this.#callback();
  }

  public canInteractWith(): boolean {
    return this.#canInteractCheck();
  }
}
