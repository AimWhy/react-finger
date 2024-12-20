/**
 * @homepage https://github.com/Houfeng/react-finger
 * @author Houfeng <houzhanfeng@gmail.com>
 */

export type AnyFunction = (...args: any) => any;

export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === "function";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export type PointerPointLike = {
  clientX: number;
  clientY: number;
};

export function calcDistance(from: PointerPointLike, to: PointerPointLike) {
  if (!from || !to) return 0;
  const x = from.clientX - to.clientX;
  const y = from.clientY - to.clientY;
  return Math.sqrt(x * x + y * y);
}

export function calcCenter(
  pointer1: PointerPointLike,
  pointer2: PointerPointLike
): PointerPointLike {
  const maxX = Math.max(pointer1.clientX, pointer2.clientX);
  const minX = Math.min(pointer1.clientX, pointer2.clientX);
  const clientX = minX + (maxX - minX) / 2;
  const maxY = Math.max(pointer1.clientY, pointer2.clientY);
  const minY = Math.min(pointer1.clientY, pointer2.clientY);
  const clientY = minY + (maxY - minY) / 2;
  return { clientX, clientY };
}

export function calcRotate(
  pointer1: PointerPointLike,
  pointer2: PointerPointLike
) {
  const radians = Math.atan2(
    pointer2.clientY - pointer1.clientY,
    pointer2.clientX - pointer1.clientX
  );
  const degrees = radians * (180 / Math.PI);
  return degrees;
}

export const isIPadPro =
  typeof navigator !== "undefined" &&
  navigator.platform?.match("Mac") &&
  (navigator.maxTouchPoints || 0) > 1;

export const isIOS =
  (typeof navigator !== "undefined" &&
    /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) ||
  isIPadPro;
