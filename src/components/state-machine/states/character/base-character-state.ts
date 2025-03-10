import { isArcadePhysicsBody } from '../../../../common/utils';
import { CharacterGameObject } from '../../../../game-objects/common/character-game-object';
import { State, StateMachine } from '../../state-machine';

export abstract class BaseCharacterState implements State {
  protected _gameObject: CharacterGameObject;
  protected _stateMachine!: StateMachine;
  #name: string;

  constructor(name: string, gameObject: CharacterGameObject) {
    this._gameObject = gameObject;
    this.#name = name;
  }

  get name(): string {
    return this.#name;
  }

  set stateMachine(stateMachine: StateMachine) {
    this._stateMachine = stateMachine;
  }

  protected _resetObjectVelocity(): void {
    if (!isArcadePhysicsBody(this._gameObject.body)) {
      return;
    }
    this._gameObject.body.velocity.x = 0;
    this._gameObject.body.velocity.y = 0;
  }
}
