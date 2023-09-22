export function calculateInputDisabledState(
  element:
    | HTMLButtonElement
    | HTMLFieldSetElement
    | HTMLInputElement
    | HTMLOptGroupElement
    | HTMLOptionElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | HTMLGuxDropdownElement
    | HTMLGuxDropdownMultiElement
): boolean {
  const fieldSet = element.closest('fieldset');

  return element.disabled || fieldSet?.disabled;
}
