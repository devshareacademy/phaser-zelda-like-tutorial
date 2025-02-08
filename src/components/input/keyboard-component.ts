import * as Phaser from 'phaser';
import { InputComponent } from './input-component';

export class KeyboardComponent extends InputComponent {
  #cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  #attackKey: Phaser.Input.Keyboard.Key;
  #actionKey: Phaser.Input.Keyboard.Key;
  #enterKey: Phaser.Input.Keyboard.Key;

  constructor(keyboardPlugin: Phaser.Input.Keyboard.KeyboardPlugin) {
    super();
    this.#cursorKeys = keyboardPlugin.createCursorKeys();
    this.#attackKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // z = B, Attack
    // x = A, Talk, Run, Lift/Throw, Push/Pull
    // shift = Select, Open Save Menu
    // return/enter = Start, Open Inventory
  }

  get isUpDown(): boolean {
    return this.#cursorKeys.up.isDown;
  }

  get isUpJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up);
  }

  get isDownDown(): boolean {
    return this.#cursorKeys.down.isDown;
  }

  get isDownJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down);
  }

  get isLeftDown(): boolean {
    return this.#cursorKeys.left.isDown;
  }

  get isRightDown(): boolean {
    return this.#cursorKeys.right.isDown;
  }

  get isActionKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#actionKey);
  }

  get isAttackKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#attackKey);
  }

  get isSelectKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift);
  }

  get isEnterKeyJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }
}
