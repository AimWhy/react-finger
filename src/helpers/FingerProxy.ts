/**
 * @homepage https://github.com/Houfeng/react-finger
 * @author Houfeng <houzhanfeng@gmail.com>
 */

import {
  FingerPointerEvent,
  FingerPointerEventListener,
} from "../core/FingerPointerEvents";
import {
  Fragment,
  HTMLAttributes,
  ReactNode,
  createContext,
  createElement,
  forwardRef,
  memo,
  useContext,
  useLayoutEffect,
  useMemo,
} from "react";

import { AnyFunction } from "../core/FingerUtils";
import { EventEmitter } from "eify";
import { FingerMixEvents } from "../core/FingerMixEvents";
import { HostEvents } from "../core/FingerHostEvents";
import { useFingerEvents } from "./FingerHook";

type FingerProxyEventTarget = {
  addEventListener: (
    name: string,
    listener: AnyFunction,
    options?: unknown
  ) => void;
  removeEventListener: (
    name: string,
    listener: AnyFunction,
    options?: unknown
  ) => void;
};

export type FingerProxyProps = Partial<FingerMixEvents> & {
  target?: FingerProxyEventTarget;
  passive?: boolean;
};

function toNativeEventName(name: string) {
  return name.slice(2).toLocaleLowerCase();
}

const FingerProxyContext = createContext<FingerProxyEventTarget>(null);

/**
 * 手势事件代理组件，主要有两个能力
 *    1. 用于以组件式 API 代理到 window、document 等原生对象
 *    2. 将事件代理到父层的某个 FingerProxyBoundary 上
 *
 * 当前未指定 target 时：
 *    1. 如果上层有 FingerProxyBoundary 将代理到最近的 FingerProxyBoundary
 *    2. 如果上层没有有 FingerProxyBoundary 将代理到 document
 * 当前指定了 target 时
 *    1. 总是代理到指定的 target
 *
 * @param props 属性
 * @returns JSX.Element
 */
export const FingerProxy = memo(function FingerProxy(props: FingerProxyProps) {
  // * 当使用 useFingerEvents 返回结果再作为属性用于 FingerProxy 时,
  // * 在 Provider 中的 handle 方法看起来会进入两次，是因为经历了两次 compose
  // * 在 FingerProxy 上直接使用事件，便不会两次。此外，进入两次并不会产生问题。
  const contextTarget = useContext(FingerProxyContext);
  const {
    target = contextTarget || (document as FingerProxyEventTarget),
    passive = true,
    ...others
  } = props;
  const events = useFingerEvents(others);
  useLayoutEffect(() => {
    const isProxyBoundary = !!contextTarget;
    const eventEntries = Object.entries<AnyFunction>(events);
    eventEntries.forEach(([name, listener]) => {
      name = isProxyBoundary ? name : toNativeEventName(name);
      target.addEventListener(name, listener, { passive });
    }, false);
    return () => {
      eventEntries.forEach(([name, listener]) => {
        name = isProxyBoundary ? name : toNativeEventName(name);
        target.removeEventListener(name, listener);
      }, false);
    };
  }, Object.values(props));
  return createElement(Fragment);
});

/**
 * FingerProxyBoundaryEventTarget
 * @returns events & Proxy EventTarget
 */
function FingerProxyBoundaryOwner(): [HostEvents, FingerProxyEventTarget] {
  const emitter = new EventEmitter<HostEvents>();
  const events: HostEvents = {
    onPointerDown: (event) => emitter.emit("onPointerDown", event),
    onPointerMove: (event) => emitter.emit("onPointerMove", event),
    onPointerUp: (event) => emitter.emit("onPointerUp", event),
    onPointerCancel: (event) => emitter.emit("onPointerCancel", event),
    onKeyDown: (event) => emitter.emit("onKeyDown", event),
    onKeyUp: (event) => emitter.emit("onKeyUp", event),
  };
  const addEventListener = (
    name: keyof HostEvents,
    listener: FingerPointerEventListener<FingerPointerEvent>
  ) => emitter.addListener(name, listener);
  const removeEventListener = (
    name: keyof HostEvents,
    listener: FingerPointerEventListener<FingerPointerEvent>
  ) => emitter.removeListener(name, listener);
  return [events, { addEventListener, removeEventListener }];
}

export type FingerProxyBoundaryProps = {
  children: (events: HostEvents) => ReactNode;
};

/**
 * 代理边界组件，能影响所有子组件中的 FingerProxy
 * 注意：下层所有未指定 target 的 FingerProxy，将代理到最近的 FingerProxyBoundary
 *
 * @param props 属性
 * @returns JSX.Element
 */
export const FingerProxyBoundary = memo(function FingerProxyBoundary(
  props: FingerProxyBoundaryProps
) {
  const { children } = props;
  const [events, target] = useMemo(() => FingerProxyBoundaryOwner(), []);
  return createElement(FingerProxyContext.Provider, {
    value: target,
    children: children(events),
  });
});

export type FingerProxyContainerProps<T extends Element = Element> =
  HTMLAttributes<T> & { children?: ReactNode };

/**
 * 将一个原生 HTML 标签，转换为具备 FingerProxyBoundary 能力的高阶容器组件
 *
 * @param props 属性
 * @returns JSX.Element
 */
export function FingerProxyContainer<T extends keyof HTMLElementTagNameMap>(
  type: T
) {
  return forwardRef<
    HTMLElementTagNameMap[T],
    FingerProxyContainerProps<HTMLElementTagNameMap[T]>
  >(function FingerProxyContainerComponent(props, ref) {
    return createElement(FingerProxyBoundary, {
      children: (events) => createElement(type, { ...props, ...events, ref }),
    });
  });
}
