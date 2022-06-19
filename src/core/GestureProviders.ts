/**
 * @homepage https://github.com/Houfeng/mota-gesture
 * @author Houfeng <houzhanfeng@gmail.com>
 */

import { GestureContext } from "./GestureContext";
import { GestureMixEvents } from "./GestureEvents";
import { GesturePointerEvent } from "./GesturePointerEvents";

export type GestureProviderParams = {
  events: Partial<GestureMixEvents>;
  context: GestureContext;
  pointer: GesturePointerEvent;
};

export type GestureProvideHandler = (params: GestureProviderParams) => void;

export type GestureProvider = Partial<{
  handlePointerWillDown: GestureProvideHandler;
  handlePointerDown: GestureProvideHandler;
  handlePointerWillMove: GestureProvideHandler;
  handlePointerMove: GestureProvideHandler;
  handlePointerWillUp: GestureProvideHandler;
  handlePointerUp: GestureProvideHandler;
  handlePointerWillCancel: GestureProvideHandler;
  handlePointerCancel: GestureProvideHandler;
}>;

const providers = new Set<GestureProvider>();

export function registerGestureProvider(provider: GestureProvider) {
  providers.add(provider);
}

export function getAllGestureProviders() {
  return providers;
}