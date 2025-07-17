/**
 * Svelte action that dispatches a custom event when a click occurs outside of the element.
 *
 * @param {HTMLElement} node - The node the action is attached to
 * @param {Object} options - Action options
 * @param {boolean} options.enabled - Whether the action is enabled
 * @param {Function} options.callback - Callback to execute when click occurs outside
 * @returns {{destroy: function()}} Action API
 */
export function clickOutside(node, { enabled = true, callback = () => {} } = {}) {
  const handleClick = (event) => {
    if (!node.contains(event.target) && enabled) {
      callback();
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    update(params) {
      enabled = params.enabled;
      callback = params.callback;
    },
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
}
