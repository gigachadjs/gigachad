import { ChadElement } from "./element";

type MountingCallback = () => void;

let connected: MountingCallback | null;
let disconnected: MountingCallback | null;

export function startCollectingMountCallbacks() {
  connected = null;
  disconnected = null;
}

export function endCollectingMountCallbacks() {
  startCollectingMountCallbacks();
}

export function onConnected(callback: MountingCallback) {
  connected = callback;
}

export function onDisconnected(callback: MountingCallback) {
  disconnected = callback;
}

export function setupMountCallbacks(this: ChadElement) {
  if (connected) {
    this.connected = connected;
  }

  if (disconnected) {
    this.disconnected = disconnected;
  }
}
