import { DependencyList, useCallback, useEffect } from "react";

function useEventListener(
  element: Element | null,
  event: string,
  callback: (...args: any[]) => any,
  dependencies: DependencyList,
  options?: AddEventListenerOptions
) {
  if (!element) return;

  const handler = useCallback(callback, dependencies);

  useEffect(() => {
    element.addEventListener(event, handler, options);

    return () => {
      element.removeEventListener(event, handler, options);
    };
  }, dependencies);
}

export function useForeignEventListener(
  selector: string,
  event: string,
  callback: (...args: any[]) => any,
  dependencies: DependencyList,
  options?: AddEventListenerOptions
) {
  useEventListener(document.querySelector(selector), event, callback, dependencies, options);
}
