import {
  Component,
  Element,
  forceUpdate,
  h,
  Host,
  JSX,
  Listen,
  Prop,
  State
} from '@stencil/core';

import { calculateInputDisabledState } from '@utils/dom/calculate-input-disabled-state';
import { onInputDisabledStateChange } from '@utils/dom/on-input-disabled-state-change';
import { OnMutation } from '@utils/decorator/on-mutation';
import { onRequiredChange } from '@utils/dom/on-attribute-change';
import { preventBrowserValidationStyling } from '@utils/dom/prevent-browser-validation-styling';
import { hasSlot } from '@utils/dom/has-slot';

import {
  GuxFormFieldHelp,
  GuxFormFieldError,
  GuxFormFieldLabel,
  GuxFormFieldContainer
} from '../../functional-components/functional-components';

import { GuxFormFieldLabelPosition } from '../../gux-form-field.types';
import {
  getComputedLabelPosition,
  validateFormIds,
  getSlottedInput
} from '../../gux-form-field.service';
import { trackComponent } from '@utils/tracking/usage';
import { OnResize } from '@utils/decorator/on-resize';

/**
 * @slot input - Required slot for input tag
 * @slot label - Required slot for label tag
 * @slot error - Optional slot for error message
 * @slot help - Optional slot for help message
 */
@Component({
  styleUrl: 'gux-form-field-range.scss',
  tag: 'gux-form-field-range',
  shadow: true
})
export class GuxFormField {
  private input: HTMLInputElement;
  private label: HTMLLabelElement;
  private disabledObserver: MutationObserver;
  private requiredObserver: MutationObserver;

  private containerElement: HTMLDivElement;
  private progressElement: HTMLDivElement;
  private tooltipElement: HTMLGuxTooltipBaseBetaElement;

  @Element()
  private root: HTMLElement;

  @Prop()
  displayUnits: string;

  @Prop()
  valueInTooltip: boolean;

  @Prop()
  labelPosition: GuxFormFieldLabelPosition;

  @State()
  private computedLabelPosition: GuxFormFieldLabelPosition = 'above';

  @State()
  private disabled: boolean;

  @State()
  private required: boolean;

  @State()
  private hasError: boolean = false;

  @State()
  private hasHelp: boolean = false;

  @State()
  private value: string;

  @State()
  private active: boolean;

  @State()
  private valueWatcherId: ReturnType<typeof setTimeout>;

  @Listen('input')
  onInput(e: MouseEvent): void {
    const input = e.target as HTMLInputElement;
    this.updateValue(input.value);
  }

  @Listen('focusin')
  @Listen('mousedown')
  onMousedown(): void {
    if (!this.disabled) {
      this.active = true;
    }
  }

  @Listen('focusout')
  @Listen('mouseup')
  onMouseup(): void {
    this.active = false;
  }

  @OnMutation({ childList: true, subtree: true })
  onMutation(): void {
    this.hasError = hasSlot(this.root, 'error');
    this.hasHelp = hasSlot(this.root, 'help');
  }

  componentWillLoad(): void {
    this.setInput();
    this.setLabel();

    this.hasError = hasSlot(this.root, 'error');
    this.hasHelp = hasSlot(this.root, 'help');

    trackComponent(this.root, { variant: this.variant });
  }

  componentDidLoad(): void {
    this.updatePosition();

    /**
     * Element references are only created after first reference.
     * Trigger another render after the element references are created to update tooltip property.
     */
    if (this.tooltipElement) {
      forceUpdate(this.root);
    }
  }

  disconnectedCallback(): void {
    if (this.disabledObserver) {
      this.disabledObserver.disconnect();
    }
    if (this.requiredObserver) {
      this.requiredObserver.disconnect();
    }

    clearInterval(this.valueWatcherId);
  }

  render(): JSX.Element {
    return (
      <Host
        class={{
          'gux-active': this.active
        }}
      >
        <GuxFormFieldContainer labelPosition={this.computedLabelPosition}>
          <GuxFormFieldLabel
            position={this.computedLabelPosition}
            required={this.required}
          >
            <slot name="label" onSlotchange={() => this.setLabel()} />
          </GuxFormFieldLabel>
          <div class="gux-input-and-error-container">
            {this.renderRangeInput()}
            <GuxFormFieldError show={this.hasError}>
              <slot name="error" />
            </GuxFormFieldError>
            <GuxFormFieldHelp show={!this.hasError && this.hasHelp}>
              <slot name="help" />
            </GuxFormFieldHelp>
          </div>
        </GuxFormFieldContainer>
      </Host>
    ) as JSX.Element;
  }

  private get variant(): string {
    return this.labelPosition ? this.labelPosition.toLowerCase() : 'none';
  }

  private setInput(): void {
    this.input = getSlottedInput(
      this.root,
      'input[type="range"][slot="input"]'
    );

    preventBrowserValidationStyling(this.input);

    this.disabled = calculateInputDisabledState(this.input);
    this.required = this.input.required;
    this.value = this.input.value;

    this.disabledObserver = onInputDisabledStateChange(
      this.input,
      (disabled: boolean) => {
        this.disabled = disabled;
      }
    );
    this.requiredObserver = onRequiredChange(
      this.input,
      (required: boolean) => {
        this.required = required;
      }
    );

    clearInterval(this.valueWatcherId);

    this.valueWatcherId = setInterval(() => {
      if (this.value !== this.input.value) {
        this.updateValue(this.input.value);
      }
    }, 100);

    validateFormIds(this.root, this.input);
  }

  private setLabel(): void {
    this.label = this.root.querySelector('label[slot="label"]');

    this.computedLabelPosition = getComputedLabelPosition(
      this.label,
      this.labelPosition
    );
  }

  private renderRangeInput(): JSX.Element {
    return (
      <div
        class={{
          'gux-range-input-container': true,
          'gux-disabled': this.disabled
        }}
        ref={el => (this.containerElement = el)}
      >
        <div class="gux-range">
          <div class="gux-track">
            <div
              class="gux-progress"
              ref={el => (this.progressElement = el)}
            ></div>
          </div>
          <slot name="input" />
          {this.valueInTooltip && (
            <gux-tooltip-base-beta
              ref={el => (this.tooltipElement = el)}
              forElement={this.containerElement}
              offsetY={-10}
              placement="top"
            >
              {this.getDisplayValue()}
            </gux-tooltip-base-beta>
          )}
        </div>
        <div
          class={{
            'gux-display': true,
            'gux-hidden': this.valueInTooltip
          }}
        >
          {this.getDisplayValue()}
        </div>
      </div>
    ) as JSX.Element;
  }

  private updateValue(newValue: string): void {
    this.value = newValue;
    this.updatePosition();
  }

  @OnResize()
  private updatePosition(): void {
    const value = Number(this.input.value || 0);
    const min = Number(this.input.min || 0);
    const max = Number(this.input.max || 100);
    const placementPercentage = ((value - min) / (max - min)) * 100;

    if (this.tooltipElement) {
      const thumbDiameter = 20;
      const functionalRangeWidth =
        this.containerElement.offsetWidth - thumbDiameter;
      const percentFromCenter = placementPercentage / 100 - 0.5;

      this.tooltipElement.offsetX = percentFromCenter * functionalRangeWidth;
    }

    this.progressElement.style.width = `${placementPercentage}%`;
  }

  private getDisplayValue(): string {
    if (this.displayUnits) {
      return `${this.value}${this.displayUnits}`;
    }

    return this.value;
  }
}
