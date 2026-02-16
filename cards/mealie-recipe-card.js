class MealieRecipeCard extends HTMLElement {

  static getConfigForm() {
    return {
      schema: [
        {
          name: "mealie_instance",
          required: true,
          selector: {
            config_entry: {
              integration: "mealie",
            },
          },
        },
        {
          name: "mealie_host",
          required: false,
          selector: {
            text: {},
          },
        },
        {
          name: "recipe_id",
          required: true,
          selector: {
            text: {},
          },
        },
        {
          name: "design",
          type: "expandable",
          flatten: true,
          icon: "mdi:palette",
          schema: [
            {
              name: "show_rating",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_prep_time",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_tags",
              selector: {
                boolean: {},
              },
            },
          ],
        },
        {
          name: "interactions",
          type: "expandable",
          flatten: true,
          icon: "mdi:gesture-tap",
          schema: [
            {
              name: "tap_action",
              selector: {
                ui_action: {
                  default_action: "none",
                },
              },
            },
            {
              name: "",
              type: "optional_actions",
              flatten: true,
              schema: (
                [
                  "hold_action",
                  "double_tap_action",
                ]
              ).map((action) => ({
                name: action,
                selector: {
                  ui_action: {
                    default_action: "none",
                  },
                },
              })),
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        switch (schema.name) {
          case "mealie_instance": return "Mealie instance";
          case "mealie_host": return "Mealie host (optional)";
          case "recipe_id": return "Recipe ID";
          default: return "";
        }
      },
      computeHelper: (schema) => {
        switch (schema.name) {
          case "mealie_instance": return "The Mealie instance to display recipies from";
          case "mealie_host": return "The host of the Mealie instance (optional, required for loading images, e.g., http://localhost:9000)";
          case "recipe_id": return "The UUID of the recipe to display (format: 4256b18c-d25d-4f4f-86fe-6b815c4d1cef)";
          default: return "";
        }
      },
      assertConfig: (config) => {
        // Optional: Log validation issues but don't throw to keep visual editor available
        // This allows users to fix invalid configs via the visual editor
        if (!config.mealie_instance) {
          console.warn("Mealie Recipe Card: The Mealie instance is required");
          return;
        }
        if (!config.recipe_id) {
          console.warn("Mealie Recipe Card: The recipe ID is required");
          return;
        }
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(config.recipe_id)) {
          console.warn("Mealie Recipe Card: The recipe ID must be a valid UUID");
          return;
        }
      }
    };
  }

  /**
   * Return stub configuration for the visual editor preview
   * @returns {Object} Stub configuration
   */
  static getStubConfig() {
    return {
      mealie_instance: "none",
      mealie_host: "",
      recipe_id: "",
      tap_action: { action: 'none' },
      show_prep_time: true,
      show_rating: true,
      show_tags: false,
    };
  }

  /**
   * Standard HA pattern: Use shouldUpdate to prevent unnecessary re-renders
   */
  shouldUpdate(changedProps) {
    return this.recipe === undefined || this.recipe.id !== this.config.recipe_id || this.skeleton;
  }

  render() {
    // Render recipe content

    if (!this.content){
      this.innerHTML = `
        <ha-card style="cursor: pointer; overflow: hidden;">
          <div class="card-content fit-rows" style="padding: 0px; ${this.skeleton ? 'height: 200px;' : ''}"></div>
        </ha-card>
      `;
      this.content = this.querySelector(".card-content");
    }

    if (this.recipe || this.skeleton) {
      this.content.innerHTML = `
        <div class="recipe" id="recipe_${this.config.recipe_id}" style="width: 100%; height: 100%; overflow: hidden; display: flex; flex-direction: column;">
        <div class="image" style="width: 100%; height: -webkit-fill-available; background: url('${this._get_image_url()}') no-repeat center center / cover;"></div>
        <div class="recipe-details" style="padding-left: 0px; padding-right: 0px; padding-bottom: 8px; width: 100%;">
          <h2 slot="primary" class="title" style="margin: 0; font-size: var(--ha-font-size-m); font-weight: var(--ha-font-weight-medium); padding: 0px 16px; margin-top: 8px;">${this.recipe.name}</h2>
          <div class="rating prep-time tags" style="display: flex; align-items: center; gap: 12px; margin-top: 8px; flex-wrap: wrap; padding: 0px 16px;">
            ${this.config.show_rating ? `<div class="rating" style="display: flex; gap: 2px;">
              <ha-icon icon="${this.recipe.rating > 0 ? 'mdi:star' : 'mdi:star-outline'}" style="color: var(--accent-color, rgb(151, 53, 66));"></ha-icon>
              <ha-icon icon="${this.recipe.rating > 1 ? 'mdi:star' : 'mdi:star-outline'}" style="color: var(--accent-color, rgb(151, 53, 66));"></ha-icon>
              <ha-icon icon="${this.recipe.rating > 2 ? 'mdi:star' : 'mdi:star-outline'}" style="color: var(--accent-color, rgb(151, 53, 66));"></ha-icon>
              <ha-icon icon="${this.recipe.rating > 3 ? 'mdi:star' : 'mdi:star-outline'}" style="color: var(--accent-color, rgb(151, 53, 66));"></ha-icon>
              <ha-icon icon="${this.recipe.rating > 4 ? 'mdi:star' : 'mdi:star-outline'}" style="color: var(--accent-color, rgb(151, 53, 66));"></ha-icon>
            </div>` : ''}
            ${this.recipe.total_time && this.config.show_prep_time ? `<div class="prep-time" style="display: flex; align-items: center; gap: 2px; background-color: rgba(var(--my-color-rgb), 0.1); border-radius: 12px; color: var(--accent-color, rgb(151, 53, 66));">
              <ha-icon icon="mdi:clock-outline" style="font-size: 1em;"></ha-icon>
              <span style="font-size: 0.7em; margin-right: 8px;">${this.recipe.total_time}</span>
            </div>` : ''}
            ${this.recipe.tags && this.recipe.tags.length > 0 && this.config.show_tags ? `<div class="tags" style="display: flex; gap: 0px; overflow: auto; white-space: nowrap; margin-left: -16px; margin-right: -16px; padding-left: 16px; padding-right: 16px;">
            ${this.recipe.tags.map(tag => `<div style="display: flex; align-items: center; gap: 2px; border-radius: 12px; color: var(--accent-color, rgb(151, 53, 66)); flex-shrink: 0; padding: 0 8px;">
              <ha-icon icon="mdi:tag" style="font-size: 0.8em;"></ha-icon>
              <span style="font-size: 0.7em;">${tag.name}</span>
            </div>`).join('')}
            </div>` : ''}
          </div>
        </div>
      `;
      if (!this.skeleton) {
        this.apply_event_handlers();
      }
    } else if (this.recipe_loading) {
      this.content.innerHTML = `<p>Lade Rezept...</p>`;
    } else {
      this.content.innerHTML = `<p>Kein Rezept verfügbar.</p>`;
    }
    return this.innerHTML;
  }

  apply_event_handlers() {
    this.content.querySelector(".recipe").addEventListener("click", (event) => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
      if (this.longpress) {
        this.longpress = false;
        return false;
      }
      if (event.detail === 1) {
        this.dbltimer = setTimeout(() => {
          this.handleClick(this, this._hass, this.config, false, false);
        }, 200)
      }
    });
    this.content.querySelector(".recipe").addEventListener('dblclick', event => {
      clearTimeout(this.dbltimer)
      this.handleClick(this, this._hass, this.config, false, true);
    })
    this.content.querySelector(".recipe").addEventListener("mousedown", event => {
      if (event.type === "click" && event.button !== 0) {
        return;
      }
      if (this.presstimer === null) {
        this.presstimer = setTimeout(() => {
          this.longpress = true;
          this.handleClick(this, this._hass, this.config, true, false);
        }, 1000);
      }
    });
    this.content.querySelector(".recipe").addEventListener("touchstart", event => {
      if (event.type === "click" && event.button !== 0) {
        return;
      }
      if (this.presstimer === null) {
        this.presstimer = setTimeout(() => {
          this.longpress = true;
          this.handleClick(this, this._hass, this.config, true, false);
        }, 1000);
      }
    });
    this.content.querySelector(".recipe").addEventListener("mouseout", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.content.querySelector(".recipe").addEventListener("touchend", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.content.querySelector(".recipe").addEventListener("touchleave", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.content.querySelector(".recipe").addEventListener("touchcancel", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
  }

  /**
   * Update hass object
   * @param {Object} hass - Home Assistant object
   */
  set hass(hass) {
    console.log("Mealie Recipe Card: Setting hass instance");
    this._hass = hass;
    if (this.skeleton) {
      this.render();
      return;
    }

    // Load recipe if not already loaded
    if (!this.recipe && !this.recipe_loading) {
      this.recipe_loading = true;
      this._async_get_recipe(this.config.mealie_instance, this.config.recipe_id).then((recipe) => {
        if (!recipe) {
          this.recipe_loading = false;
          return;
        }
        console.log("Mealie Recipe Card: Loaded recipe", recipe);
        this.recipe_loading = false;
        this.recipe = recipe;
        this.render();
      });
    }
  }

  /**
   * Get the hass object
   * @returns {Object} Home Assistant object
   */
  get hass() {
    return this._hass;
  }

  setConfig(config) {
    // Validate required configuration
    if (!config) {
      throw new Error("Invalid configuration: config is required");
    }

    this.skeleton = config.mealie_instance === "none";

    if (this.skeleton) {
      console.log("Mealie Recipe Card: Skeleton mode enabled");
      this.config = config;
      this.recipe = {
        id: config.recipe_id,
        name: "name",
        rating: 4,
        total_time: "45 min"
      }
      return;
    }

    if (!config.mealie_instance) {
      throw new Error("Invalid configuration: 'mealie_instance' is required");
    }

    if (!config.recipe_id) {
      throw new Error("Invalid configuration: 'recipe_id' is required");
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(config.recipe_id) && config.recipe_id !== "") {
      throw new Error("Invalid configuration: 'recipe_id' must be a valid UUID (e.g., 4256b18c-d25d-4f4f-86fe-6b815c4d1cef)");
    }

    // Store validated config
    this.config = config;

  }

  async _async_get_recipe(instance, recipe_id) {
    if (this.skeleton) {
      console.log("Mealie Recipe Card: Skeleton mode enabled, skipping recipe load");
      return;
    }

    if (!this._hass) {
      console.error("Mealie Recipe Card: Home Assistant instance not available");
      return;
    }

    const domain = "mealie";
    const service = "get_recipe";
    const serviceData = {
      config_entry_id: instance,
      recipe_id: recipe_id
    };

    try {
      const response = await this._hass.callService(
        domain,
        service,
        serviceData,
        {},
        true,
        true
      );
      //console.log(`Mealie Recipe Card: Called service ${domain}.${service}`, serviceData);
      //console.log(`Mealie Recipe Card: Service response:`, response);
      return response.response.recipe;
    } catch (error) {
      console.error(`Mealie Recipe Card: Failed to call service ${domain}.${service}:`, error);
    }
  }

  _get_image_url() {
    if (this.skeleton) {
      return "http://picsum.photos/id/292/3852/2556";
    }
    return `${this.config.mealie_host || "http://localhost:9000"}/api/media/recipes/${this.config.recipe_id}/images/min-original.webp`;
  }

  /**
   * Return the card size for proper layout
   * @returns {number} Card size
   */
  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return {
      rows: 4,
      columns: 12,
      min_columns: 6,
      min_rows: 3,
      max_rows: 10,
    };
  }

  handleClick(node, hass, config, hold, dblClick, actionConfig = null){

    if (dblClick && config.double_tap_action) {
      actionConfig = config.double_tap_action;
      console.log("Mealie Recipe Card: Double tap action triggered", actionConfig);
    } else if (hold && config.hold_action) {
      actionConfig = config.hold_action;
      console.log("Mealie Recipe Card: Hold action triggered", actionConfig);
    } else if (!hold && config.tap_action) {
      actionConfig = config.tap_action;
      console.log("Mealie Recipe Card: Tap action triggered", actionConfig);
    }

    if (!actionConfig) {
      actionConfig = {
        action: "more-info"
      };
    }

    if (
      actionConfig.confirmation &&
      (!actionConfig.confirmation.exemptions ||
        !actionConfig.confirmation.exemptions.some(
          e => e.user === hass.user.id
        ))
    ) {
      if (
        !confirm(
          actionConfig.confirmation.text ||
            `Are you sure you want to ${actionConfig.action}?`
        )
      ) {
        return;
      }
    }

    switch (actionConfig.action) {
      case "more-info":
        if (actionConfig.entity || config.entity || config.camera_image) {
          this.fireEvent(node, "hass-more-info", {
            entityId: actionConfig.entity
              ? actionConfig.entity
              : config.entity
              ? config.entity
              : config.camera_image
          });
          if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        }
        break;
      case "navigate":
        if (actionConfig.navigation_path) {
          this.navigate(node, actionConfig.navigation_path);
          if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        }
        break;
      case "url":
        actionConfig.url_path && window.open(actionConfig.url_path);
        if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        break;
      case "toggle":
        if (config.entity) {
          toggleEntity(hass, config.entity);
          if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        }
        break;
      case "call-service": {
        if (!actionConfig.service) {
          return;
        }
        const [domain, service] = actionConfig.service.split(".", 2);
        const serviceData = { ...actionConfig.service_data };
        if (serviceData.entity_id === "entity") {
          serviceData.entity_id = config.entity;
        }
        hass.callService(domain, service, serviceData, actionConfig.target);
        if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        break;
      }
      case "perform-action": {
        if (!actionConfig.perform_action) {
          return;
        }
        const [domain, service] = actionConfig.perform_action.split(".", 2);
        const serviceData = { ...actionConfig.data };
        if (serviceData.entity_id === "entity") {
          serviceData.entity_id = config.entity;
        }
        hass.callService(domain, service, serviceData, actionConfig.target);
        if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        break;
      }
      case "fire-dom-event": {
        this.fireEvent(node, "ll-custom", actionConfig);
        if (actionConfig.haptic) this.forwardHaptic(actionConfig.haptic);
        break;
      }
    }
  };

  fireEvent(node, type, detail, options){
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  };

  forwardHaptic(hapticType){
    this.fireEvent(window, "haptic", hapticType);
  };

  navigate(_node, path, replace = false){
    if (replace) {
      history.replaceState(null, "", path);
    } else {
      history.pushState(null, "", path);
    }
    this.fireEvent(window, "location-changed", {
      replace
    });
  };

}



customElements.define("mealie-recipe-card", MealieRecipeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mealie-recipe-card",
  name: "Mealie Recipe Card",
  description: "Zeigt ein Rezept von Mealie an.",
  preview: true,
});
