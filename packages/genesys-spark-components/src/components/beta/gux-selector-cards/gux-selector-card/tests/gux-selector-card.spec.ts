import { newSpecPage } from '@test/specTestUtils';

import { GuxSelectorCard } from '../gux-selector-card';

const components = [GuxSelectorCard];
const language = 'en';

describe('gux-form-field-radio', () => {
  describe('#render', () => {
    [
      `
      <gux-selector-card-beta variant="simple">
        <label slot="label" for="second">Card Label</label>
        <input
          slot="input"
          id="second"
          type="radio"
          name="example2"
          disabled
          value="card-label"
        />
        <gux-icon slot="icon" icon-name="fa/diamond-regular" decorative />
        <span slot="content" id="existing-id"
          >A second label for a sample selector card. Used in Spark WCL.</span
        >
      </gux-selector-card-beta>
      `,
      `
      <gux-selector-card-beta variant="simple">
        <label slot="label" for="third">Card Label</label>
        <input
          slot="input"
          id="third"
          type="radio"
          name="example3"
          disabled
          checked
          value="card-label"
        />
        <gux-icon slot="icon" icon-name="fa/diamond-regular" decorative />
      </gux-selector-card-beta>
      `,
      `
      <gux-selector-card-beta variant="simple">
        <label slot="label" for="fourth">A longer card label example</label>
        <input
          slot="input"
          id="fourth"
          type="radio"
          name="example4"
          value="card-label"
        />
        <gux-icon slot="icon" icon-name="fa/diamond-regular" decorative />
      </gux-selector-card-beta>
      `
    ].forEach((html, index) => {
      it(`should render component as expected (${index + 1})`, async () => {
        const page = await newSpecPage({ components, html, language });

        expect(page.root).toMatchSnapshot();
      });
    });
  });
});
