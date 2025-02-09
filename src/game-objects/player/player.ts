import * as Phaser from 'phaser';
import { Direction, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { ControlsComponent } from '../../components/game-object/controls-component';
import { StateMachine } from '../../components/state-machine/state-machine';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { SpeedComponent } from '../../components/game-object/speed-component';
import { PLAYER_SPEED } from '../../common/config';
import { DirectionComponent } from '../../components/game-object/direction-component';

export type PlayerConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  controls: InputComponent;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  #controlsComponent: ControlsComponent;
  #speedComponent: SpeedComponent;
  #directionComponent: DirectionComponent;
  #stateMachine: StateMachine;

  constructor(config: PlayerConfig) {
    const { scene, position, assetKey, frame } = config;
    const { x, y } = position;
    super(scene, x, y, assetKey, frame || 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // add components
    this.#controlsComponent = new ControlsComponent(this, config.controls);
    this.#speedComponent = new SpeedComponent(this, PLAYER_SPEED);
    this.#directionComponent = new DirectionComponent(this);

    // add state machine
    this.#stateMachine = new StateMachine('player');
    this.#stateMachine.addState(new IdleState(this));
    this.#stateMachine.addState(new MoveState(this));
    this.#stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

    // enable auto update functionality
    config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    config.scene.events.once(
      Phaser.Scenes.Events.SHUTDOWN,
      () => {
        config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      },
      this,
    );
  }

  get controls(): InputComponent {
    return this.#controlsComponent.controls;
  }

  get speed(): number {
    return this.#speedComponent.speed;
  }

  get direction(): Direction {
    return this.#directionComponent.direction;
  }

  set direction(value: Direction) {
    this.#directionComponent.direction = value;
  }

  public update(): void {
    this.#stateMachine.update();
  }
}
