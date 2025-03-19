export class InputComponent {
  #up: boolean;
  #down: boolean;
  #left: boolean;
  #right: boolean;
  #actionKey: boolean;
  #attackKey: boolean;
  #selectKey: boolean;
  #enterKey: boolean;
  #isMovementLocked: boolean;

  constructor() {
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#down = false;
    this.#actionKey = false;
    this.#attackKey = false;
    this.#selectKey = false;
    this.#enterKey = false;
    this.#isMovementLocked = false;
  }

  get isMovementLocked(): boolean {
    return this.#isMovementLocked;
  }

  set isMovementLocked(val: boolean) {
    this.#isMovementLocked = val;
  }

  get isUpDown(): boolean {
    return this.#up;
  }

  get isUpJustDown(): boolean {
    return this.#up;
  }

  set isUpDown(val: boolean) {
    this.#up = val;
  }

  get isDownDown(): boolean {
    return this.#down;
  }

  get isDownJustDown(): boolean {
    return this.#down;
  }

  set isDownDown(val: boolean) {
    this.#down = val;
  }

  get isLeftDown(): boolean {
    return this.#left;
  }

  set isLeftDown(val: boolean) {
    this.#left = val;
  }

  get isRightDown(): boolean {
    return this.#right;
  }

  set isRightDown(val: boolean) {
    this.#right = val;
  }

  get isActionKeyJustDown(): boolean {
    return this.#actionKey;
  }

  set isActionKeyJustDown(val: boolean) {
    this.#actionKey = val;
  }

  get isAttackKeyJustDown(): boolean {
    return this.#attackKey;
  }

  set isAttackKeyJustDown(val: boolean) {
    this.#attackKey = val;
  }

  get isSelectKeyJustDown(): boolean {
    return this.#selectKey;
  }

  set isSelectKeyJustDown(val: boolean) {
    this.#selectKey = val;
  }

  get isEnterKeyJustDown(): boolean {
    return this.#enterKey;
  }

  set isEnterKeyJustDown(val: boolean) {
    this.#enterKey = val;
  }

  public reset(): void {
    this.#down = false;
    this.#up = false;
    this.#left = false;
    this.#right = false;
    this.#attackKey = false;
    this.#actionKey = false;
    this.#selectKey = false;
    this.#enterKey = false;
    this.#isMovementLocked = false;
  }
}
