/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
// This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers
import { ActionHandlerEvent, HomeAssistant, hasConfigOrEntityChanged } from 'custom-card-helpers';

import type { BVOTDCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

import verses from './verses.json';
import { actionHandler } from './action-handler-directive';

/* eslint no-console: 0 */
console.info(
  `%c  bvotd-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'bvotd-card',
  name: 'bvotd Card',
  description: 'A Bible Verse of the Day card.',
});

@customElement('bvotd-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class BVOTDCard extends LitElement {
  // public static async getConfigElement(): Promise<LovelaceCardEditor> {
  //   await import('./editor');
  //   return document.createElement('bvotd-card-editor');
  // }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: BVOTDCardConfig;

  public getVerseId(verse?: number) {
    return verse || Math.floor(Math.random() * verses.length);
  }

  public getVerse(id: number) {
    return verses[id];
  }

  public setConfig(config: BVOTDCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    const vId = this.getVerseId(config.verse);

    this.config = {
      name: 'BVOTDCard',
      verse: vId,
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this.config) return html``;

    // return html`
    //   <ha-card
    //     .header=${this.config.name}
    //     @action=${this._handleAction}
    //     .actionHandler=${actionHandler({
    //       hasHold: hasAction(this.config.hold_action),
    //       hasDoubleClick: hasAction(this.config.double_tap_action),
    //     })}
    //     tabindex="0"
    //     .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
    //   ></ha-card>
    // `;

    const verse = verses[this.config?.verse || Math.floor(Math.random() * verses.length)];
    const attrib = `${verse.book} ${verse.verse} (${verse.bible})`;

    return html` <ha-card
      tabindex="0"
      class="bvotd-card"
      @action=${this._handleAction}
      .actionHandler=${actionHandler({ hasHold: false, hasDoubleClick: false })}
    >
      <div class="bvotd-content">${verse.content}</div>
      <div class="bvotd-attrib">—${attrib}</div>
    </ha-card>`;
  }

  private _handleAction(/* ev: ActionHandlerEvent */): void {
    this.setConfig({ ...this.config, verse: this.getVerseId() });
  }

  static get styles(): CSSResultGroup {
    return css`
      .bvotd-card {
        margin: 4px;
        font-size: 20px;
        line-height: 20px;
      }
      .bvotd-content {
        padding: 16px 16px;
        overflow-wrap: break-word;
      }
      .bvotd-attrib {
        padding: 0 16px 16px;
        text-align: right;
        font-style: italic;
      }
    `;
  }
}
