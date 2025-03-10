import * as Phaser from 'phaser';
import { CustomGameObject, Direction, Position } from '../../common/types';
import { InputComponent } from '../../components/input/input-component';
import { ControlsComponent } from '../../components/game-object/controls-component';
import { StateMachine } from '../../components/state-machine/state-machine';
import { SpeedComponent } from '../../components/game-object/speed-component';
import { DirectionComponent } from '../../components/game-object/direction-component';
import { AnimationComponent, AnimationConfig } from '../../components/game-object/animation-component';
import { InvulnerableComponent } from '../../components/game-object/invulnerable-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { LifeComponent } from '../../components/game-object/life-component';

export type CharacterConfig = {
  scene: Phaser.Scene;
  position: Position;
  assetKey: string;
  frame?: number;
  inputComponent: InputComponent;
  animationConfig: AnimationConfig;
  speed: number;
  id?: string;
  isPlayer: boolean;
  isInvulnerable?: boolean;
  invulnerableAfterHitAnimationDuration?: number;
  maxLife: number;
  currentLife?: number;
};

export abstract class CharacterGameObject extends Phaser.Physics.Arcade.Sprite implements CustomGameObject {
  protected _controlsComponent: ControlsComponent;
  protected _speedComponent: SpeedComponent;
  protected _directionComponent: DirectionComponent;
  protected _animationComponent: AnimationComponent;
  protected _invulnerableComponent: InvulnerableComponent;
  protected _lifeComponent: LifeComponent;
  protected _stateMachine: StateMachine;
  protected _isPlayer: boolean;
  protected _isDefeated: boolean;

  constructor(config: CharacterConfig) {
    const {
      scene,
      position,
      assetKey,
      frame,
      speed,
      animationConfig,
      inputComponent,
      id,
      isPlayer,
      invulnerableAfterHitAnimationDuration,
      isInvulnerable,
      maxLife,
      currentLife,
    } = config;
    const { x, y } = position;
    super(scene, x, y, assetKey, frame || 0);

    // add object to scene and enable phaser physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // add shared components
    this._controlsComponent = new ControlsComponent(this, inputComponent);
    this._speedComponent = new SpeedComponent(this, speed);
    this._directionComponent = new DirectionComponent(this);
    this._animationComponent = new AnimationComponent(this, animationConfig);
    this._invulnerableComponent = new InvulnerableComponent(
      this,
      isInvulnerable || false,
      invulnerableAfterHitAnimationDuration,
    );
    this._lifeComponent = new LifeComponent(this, maxLife, currentLife);

    // create state machine
    this._stateMachine = new StateMachine(id);

    // general config
    this._isPlayer = isPlayer;
    this._isDefeated = false;
  }

  get isDefeated(): boolean {
    return this._isDefeated;
  }

  get isEnemy(): boolean {
    return !this._isPlayer;
  }

  get controls(): InputComponent {
    return this._controlsComponent.controls;
  }

  get speed(): number {
    return this._speedComponent.speed;
  }

  get direction(): Direction {
    return this._directionComponent.direction;
  }

  set direction(value: Direction) {
    this._directionComponent.direction = value;
  }

  get animationComponent(): AnimationComponent {
    return this._animationComponent;
  }

  get invulnerableComponent(): InvulnerableComponent {
    return this._invulnerableComponent;
  }

  public update(): void {
    this._stateMachine.update();
  }

  public hit(direction: Direction, damage: number): void {
    if (this._isDefeated) {
      return;
    }

    // check if character is invulnerable, if not update state to be hurt
    if (this._invulnerableComponent.invulnerable) {
      return;
    }

    // have character take damage and see if the character has died
    this._lifeComponent.takeDamage(damage);
    if (this._lifeComponent.life === 0) {
      this._isDefeated = true;
      this._stateMachine.setState(CHARACTER_STATES.DEATH_STATE, direction);
      return;
    }

    this._stateMachine.setState(CHARACTER_STATES.HURT_STATE, direction);
  }

  public disableObject(): void {
    // disable body on game object so we stop triggering the collision
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // make not active and not visible until player re-enters room
    this.active = false;
    if (!this._isPlayer) {
      this.visible = false;
    }
  }

  public enableObject(): void {
    if (this._isDefeated) {
      return;
    }

    (this.body as Phaser.Physics.Arcade.Body).enable = true;
    this.active = true;
    this.visible = true;
  }
}
