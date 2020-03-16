import { ITouchPoint } from "./ITouchPoint";
import { ITouchEvent } from "./TouchEvents";
import { TouchOptions } from "./TouchOptions";
import { ITouchHandler } from "./ITouchHandler";

export class TouchOwner implements TouchOwner {
  public startPoints?: ITouchPoint[];
  public endPoints?: ITouchPoint[];
  public isPointDown?: boolean;
  public lastTapTime?: number;
  public isDoubleTap?: boolean;
  public isSwipe?: boolean;
  public direction?: string;
  protected holdTimer?: number;

  public get startPoint() {
    return this.startPoints?.[0];
  }

  public get endPoint() {
    return this.endPoints?.[0];
  }

  public startHoldTimer(done: Function) {
    this.holdTimer = setTimeout(done, TouchOptions.holdDurationThreshold);
  }

  public clearHoldTimer() {
    clearTimeout(this.holdTimer);
  }

  public emit(event: ITouchEvent, ...handlers: ITouchHandler[]) {
    if (!handlers) return;
    Object.assign(event, this);
    handlers.forEach(handler => handler && handler(event));
  }
}

export function getEventOwner(event: ITouchEvent): TouchOwner {
  const target = event.target as any;
  if (!target.__mota_touch__) {
    target.__mota_touch__ = new TouchOwner();
  }
  return target.__mota_touch__;
}