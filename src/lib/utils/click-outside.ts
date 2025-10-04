/**
 * Svelte action that invokes a callback when a user clicks outside the bound node.
 *
 * @param {HTMLElement} node - Element receiving outside click detection.
 * @param {Object} [options] - Optional action configuration.
 * @param {boolean} [options.enabled=true] - Enables or disables the listener.
 * @param {() => void} [options.callback] - Callback executed on outside click.
 * @returns {{ update(params: ClickOutsideOptions): void; destroy(): void }} Action API.
 */
interface ClickOutsideOptions {
  enabled?: boolean;
  callback?: () => void;
}

interface ClickOutsideActionReturn {
  update: (params: ClickOutsideOptions) => void;
  destroy: () => void;
}

export function clickOutside(node: HTMLElement, { enabled = true, callback = () => {} }: ClickOutsideOptions = {}): ClickOutsideActionReturn {
  const handleClick = (event: MouseEvent): void => {
    const target = event.target as Node | null;
    if (enabled && target && !node.contains(target)) {
      callback?.();
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    update(params: ClickOutsideOptions): void {
      enabled = params.enabled ?? enabled;
      callback = params.callback ?? callback;
    },
    destroy(): void {
      document.removeEventListener('click', handleClick, true);
    },
  };
}
