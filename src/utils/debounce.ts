function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null;

  const debouncedFn = function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };

  debouncedFn.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debouncedFn;
}

export default debounce;
