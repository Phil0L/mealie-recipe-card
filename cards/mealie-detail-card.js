class MealieDetailCard extends HTMLElement {

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
          name: "todo_list_entity",
          required: false,
          selector: {
            entity: {
              domain: "todo",
            },
          },
        },
        {
          name: "design",
          type: "expandable",
          flatten: true,
          icon: "mdi:palette",
          schema: [
            {
              name: "show_description",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_navigation",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_scrollbar",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_open_original",
              selector: {
                boolean: {},
              },
            },
            {
              name: "show_open_mealie",
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
        {
          name: "custom_button",
          type: "expandable",
          flatten: false,
          icon: "mdi:play-circle-outline",
          schema: [
            {
              name: "icon",
              required: false,
              selector: {
                icon: {},
              },
            },
            {
              name: "tap_action",
              required: false,
              selector: {
                ui_action: {
                  default_action: "none",
                },
              },
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        switch (schema.name) {
          case "mealie_instance": return "Mealie instance";
          case "mealie_host": return "Mealie host (optional)";
          case "recipe_id": return "Recipe ID";
          case "todo_list_entity": return "Todo list entity (optional)";
          case "show_description": return "Show description";
          case "show_navigation": return "Show navigation buttons";
          case "show_scrollbar": return "Show horizontal scrollbar";
          case "show_open_original": return "Show open original recipe button ";
          case "show_open_mealie": return "Show open in Mealie button";
          default: return "";
        }
      },
      computeHelper: (schema) => {
        switch (schema.name) {
          case "mealie_instance": return "The Mealie instance to display recipies from";
          case "mealie_host": return "The host of the Mealie instance (optional, required for loading images, e.g., http://localhost:9000)";
          case "recipe_id": return "The UUID of the recipe to display (format: 4256b18c-d25d-4f4f-86fe-6b815c4d1cef)";
          case "todo_list_entity": return "Optionally specify a todo list entity to add ingredients to when clicking the add to list button";
          case "show_description": return "Show the recipe description in the title card";
          case "show_navigation": return "Show next/previous buttons for navigating between instructions";
          case "show_scrollbar": return "Show scrollbar on instructions (for scrolling on desktop devices)";
          case "show_open_original": return "Show button to open the original recipe URL in a new tab";
          case "show_open_mealie": return "Show button to open the recipe in Mealie in a new tab (only if mealie_host is configured)";
          default: return "";
        }
      },
      assertConfig: (config) => {
        // Optional: Log validation issues but don't throw to keep visual editor available
        // This allows users to fix invalid configs via the visual editor
        if (!config.mealie_instance) {
          console.warn("Mealie Card: The Mealie instance is required");
          return;
        }
        if (!config.recipe_id) {
          console.warn("Mealie Card: The recipe ID is required");
          return;
        }
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(config.recipe_id)) {
          console.warn("Mealie Card: The recipe ID must be a valid UUID");
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
      show_description: true,
      show_navigation: true,
      show_scrollbar: true,
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
        <ha-card class="${this.skeleton ? '' : 'card'} fit-rows recipe" style="cursor: pointer; overflow: hidden; display: flex; flex-direction: column; width: 100% ${this.config.hide_border ? 'border: none; box-shadow: none; ' : ''}">
          <h1 class="card-header" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 32px;">${this.skeleton ? 'Rezeptname' : this.recipe.name}</h1>
          <div class="card-content" style="padding: 0px; width: 100%; flex-basis: -webkit-fill-available; ${this.config.custom_height ? `height: calc(${this.config.custom_height} - 48px);` : this.skeleton ? 'height: 152px;' : 'max-height: calc(100% - 48px);'}"></div>
        </ha-card>
      `;
      this.content = this.querySelector(".card-content");
      this.haCard = this.querySelector("ha-card");
    }

    if (this.recipe || this.skeleton) {
      this.content.innerHTML = `
        <style id="mealie-card-styles"></style>
        <div class="carousel slider" style="padding: 0px; width: 100%; height: 100%; text-align: center; overflow: hidden;">
          <div class="slides" ${this.config.show_scrollbar ? '' : 'style="scrollbar-width: none; -ms-overflow-style: none;"'}">
            <div class="slide" id="slide-1">
              <div class="slide-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; padding: 16px; box-sizing: border-box;">
                <img src="${this._get_image_url()}" alt="${this.skeleton ? 'Recipe image' : this.recipe.name}" style="width: 100%; height: 100px; border-radius: 10px; flex-grow:1; object-fit: cover;">
                ${this.config.show_description ? `
                <p style="margin: 0; text-align: start; margin-top: 16px;">${this.skeleton ? 'Short description of the recipe...' : this.recipe.description}</p>
                ` : ''}
                <div style="display: flex; flex-direction: row; align-items: center; flex-grow: 0; flex-wrap: wrap; gap: 8px; justify-content: center; ${this.config.show_navigation ? 'margin: 16px 48px 0 48px;' : 'margin: 16px 0 0 0;'}">
                  ${this.recipe && this.recipe.original_url && this.config.show_open_original ? `<ha-control-button class="press-button original-link-button">
                    <ha-icon icon="mdi:open-in-new"></ha-icon>
                  </ha-control-button>` : ''}
                  ${this.config.mealie_host && this.recipe.slug && this.config.show_open_mealie ? `<ha-control-button class="press-button mealie-button">
                    <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
                  </ha-control-button>` : ''}
                  <ha-control-button class="press-button next-button start-button" style="min-width: 120px;">Start cooking</ha-control-button>
                  ${this.config.todo_list_entity ? `<ha-control-button class="press-button todo-button">
                    <ha-icon icon="mdi:playlist-plus"></ha-icon>
                  </ha-control-button>` : ''}
                  ${this.config.custom_button && this.config.custom_button.icon ? `<ha-control-button class="press-button custom-button">
                    <ha-icon icon="${this.config.custom_button.icon}"></ha-icon>
                  </ha-control-button>` : ''}
                </div>
              </div>
            </div>
            <div class="slide" id="slide-2">
              <div class="slide-content" style="display: flex; flex-direction: column; align-items: start; height: 100%; width: 100%; padding: 4px 16px 64px 16px; box-sizing: border-box; overflow-y: scroll;">
                <h2 style="margin: 0 0 8px 0; min-height: 32px;">Ingredients:</h2>
                ${this.skeleton ? '' : this.recipe.ingredients.map(ingredient =>
                  `<p style="margin: 0 0 2px 0;">${ingredient.display}</p>`
                ).join('')}
              </div>
            </div>
            ${this.skeleton ? '' : this.recipe.instructions.map((instruction, index) =>
              `<div class="slide" id="slide-${index + 3}">
                <div class="slide-content" style="display: flex; flex-direction: column; align-items: start; height: 100%; width: 100%; padding: 4px 16px 64px 16px; box-sizing: border-box; overflow-y: scroll;">
                  <h2 style="margin: 0 0 8px 0; min-height: 32px;">Step ${index + 1}: ${instruction.title ? instruction.title : ''}</h2>
                  <p style="margin: 0; text-align: start;">${instruction.text}</p>
                </div>
              </div>`
            ).join('')}
            <div class="slide" id="slide-${this.skeleton ? 3 : this.recipe.instructions.length + 3}" style="font-size: 300%;">
              Enjoy!
            </div>
          </div>
          ${this.config.show_navigation ? `
          <ha-control-button class="press-button next-button" style="position: absolute; bottom: 16px; right: 16px;">\>\></ha-control-button>
          <ha-control-button class="press-button previous-button" style="position: absolute; bottom: 16px; left: 16px; display: none;">\<\<</ha-control-button>
          ` : ''}
        </div>
      `;
      this.querySelector("#mealie-card-styles").innerHTML = `
        .slides {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          height: 100%;
        }
        .slide {
          scroll-snap-align: start;
          flex-shrink: 0;
          width: 100%;
          height: auto;
          margin-right: 8px;
          border-radius: 10px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .slide.template {
          font-size: 100px;
        }
        .slider-link {
          display: inline-flex;
          width: 1.5rem;
          height: 1.5rem;
          background: white;
          text-decoration: none;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 0 0.5rem 0;
          position: relative;
        }
        .slider-link:active {
          top: 1px;
        }
        .slider-link:focus {
          background: #000;
        }
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

  _go_carousel(direction) {
    var carouselPositions = [];
    var currentScrollLeft = this.querySelector('.slides').scrollLeft;
    var currentScrollRight = currentScrollLeft + this.querySelector('.slides').offsetWidth;
    var halfContainer = this.querySelector('.slides').offsetWidth / 2;

    this.querySelectorAll('.slide').forEach(function(div) {
      carouselPositions.push([div.offsetLeft, div.offsetLeft + div.offsetWidth]); // add to array the positions information
    })

    if (currentScrollLeft === 0 && direction === 'next') {
      this.currentItem = 1;
    } else if (currentScrollRight === this.querySelector('.slides').scrollWidth && direction === 'previous') {
      console.log('here')
      this.currentItem = carouselPositions.length - 2;
    } else {
      var currentMiddlePosition = currentScrollLeft + halfContainer;
      for (var i = 0; i < carouselPositions.length; i++) {
        if (currentMiddlePosition > carouselPositions[i][0] && currentMiddlePosition < carouselPositions[i][1]) {
          this.currentItem = i;
          if (direction === 'next') {
            this.currentItem++;
          } else if (direction === 'previous') {
            this.currentItem--
          } else if (parseInt(direction)) {
            this.currentItem = parseInt(direction);
          }
        }
      }
    }
    if (carouselPositions[this.currentItem]) {
      this.querySelector('.slides').scrollTo({
        left: carouselPositions[this.currentItem][0],
        behavior: 'smooth'
      });
    }
  }




  apply_event_handlers() {
    this.querySelector(".recipe").addEventListener("click", (event) => {
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
    this.querySelector(".recipe").addEventListener('dblclick', event => {
      clearTimeout(this.dbltimer)
      this.handleClick(this, this._hass, this.config, false, true);
    })
    this.querySelector(".recipe").addEventListener("mousedown", event => {
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
    this.querySelector(".recipe").addEventListener("touchstart", event => {
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
    this.querySelector(".recipe").addEventListener("mouseout", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.querySelector(".recipe").addEventListener("touchend", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.querySelector(".recipe").addEventListener("touchleave", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.querySelector(".recipe").addEventListener("touchcancel", event => {
      if (this.presstimer !== null) {
        clearTimeout(this.presstimer);
        this.presstimer = null;
      }
    });
    this.querySelectorAll(".next-button").forEach(button => {
      button.addEventListener("click", event => {
        this._go_carousel('next');
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".previous-button").forEach(button => {
      button.addEventListener("click", event => {
        this._go_carousel('previous');
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".slide-link").forEach((slide, index) => {
      slide.addEventListener("click", event => {
        this._go_carousel(index);
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".next-button").forEach(button => {
      button.addEventListener("mousedown", event => {
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".previous-button").forEach(button => {
      button.addEventListener("mousedown", event => {
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".slide-link").forEach((slide, index) => {
      slide.addEventListener("mousedown", event => {
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".next-button").forEach(button => {
      button.addEventListener("dblclick", event => {
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".previous-button").forEach(button => {
      button.addEventListener("dblclick", event => {
        event.stopPropagation();
      });
    });
    this.querySelectorAll(".slide-link").forEach((slide, index) => {
      slide.addEventListener("dblclick", event => {
        event.stopPropagation();
      });
    });
    this.querySelector(".slides").addEventListener("scroll", event => {
      var carouselPositions = [];
      var currentScrollLeft = this.querySelector('.slides').scrollLeft;
      var halfContainer = this.querySelector('.slides').offsetWidth / 2;

      this.querySelectorAll('.slide').forEach(function (div) {
        carouselPositions.push([div.offsetLeft, div.offsetLeft + div.offsetWidth]); // add to array the positions information
      })

      var currentMiddlePosition = currentScrollLeft + halfContainer;
      for (var i = 0; i < carouselPositions.length; i++) {
        if (currentMiddlePosition > carouselPositions[i][0] && currentMiddlePosition < carouselPositions[i][1]) {
          this.currentItem = i;
        }
      }

      if (this.currentItem >= carouselPositions.length - 1) {
        this.querySelectorAll('.next-button').forEach(button => {
          button.style.display = 'none';
        });
      } else {
        this.querySelectorAll('.next-button').forEach(button => {
          button.style.display = 'block';
        });
      }
      if (this.currentItem < 1) {
        this.querySelectorAll('.previous-button').forEach(button => {
          button.style.display = 'none';
        });
      } else {
        this.querySelectorAll('.previous-button').forEach(button => {
          button.style.display = 'block';
        });
      }
    });
    this.querySelectorAll(".todo-button").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        if (!this.config.todo_list_entity || !this.recipe || !this.recipe.ingredients) {
          return;
        }
        this.recipe.ingredients.forEach(ingredient => {
          this.handleClick(this, this._hass, this.config, false, false, {
            action: "call-service",
            service: "todo.add_item",
            service_data: {
              item: ingredient.display
            },
            target: {
              entity_id: this.config.todo_list_entity
            }
          });
        });
      });
    });
    this.querySelectorAll(".custom-button").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        if (!this.config.custom_button || !this.config.custom_button.action) {
          return;
        }
        this.handleClick(this, this._hass, this.config, false, false, this.config.custom_button.action);
      });
    });
    this.querySelectorAll(".original-link-button").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        if (this.skeleton || !this.recipe || !this.recipe.original_url) {
          console.warn("Mealie Detail Card: Original URL not available");
          return;
        }
        window.open(this.recipe.original_url, '_blank');
      });
    });
    this.querySelectorAll(".mealie-button").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        if (this.skeleton || !this.config.mealie_host || !this.recipe) {
          console.warn("Mealie Detail Card: Mealie host or recipe not available");
          return;
        }
        window.open(`${this.config.mealie_host || "http://localhost:9000"}/g/home/r/${this.recipe.slug}`, '_blank');
      });
    });
  }

  /**
   * Update hass object
   * @param {Object} hass - Home Assistant object
   */
  set hass(hass) {
    console.log("Mealie Detail Card: Setting hass instance");
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
        console.log("Mealie Detail Card: Loaded recipe", recipe);
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
      console.log("Mealie Detail Card: Skeleton mode enabled");
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
      console.log("Mealie Detail Card: Skeleton mode enabled, skipping recipe load");
      return;
    }

    if (!this._hass) {
      console.error("Mealie Detail Card: Home Assistant instance not available");
      return;
    }

    const domain = "mealie";
    const service = "get_recipe";
    const serviceData = {
      config_entry_id: instance,
      recipe_id: recipe_id
    };

    try {
      console.log(`Mealie Detail Card: Calling service ${domain}.${service}`, serviceData);
      const response = await this._hass.callService(
        domain,
        service,
        serviceData,
        {},
        false,
        true
      );

      //console.log(`Mealie Detail Card: Service response:`, response);
      return response.response.recipe;
    } catch (error) {
      console.error(`Mealie Detail Card: Failed to call service ${domain}.${service}:`, error);
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

  /**
   *
   * @returns object for allowing card sizing
   */
  getGridOptions() {
    return {
      rows: 6,
      columns: 24,
      min_columns: 6,
      min_rows: 3,
    };
  }

  handleClick(node, hass, config, hold, dblClick, actionConfig = null){

    if (!actionConfig && dblClick && config.double_tap_action) {
      actionConfig = config.double_tap_action;
      console.log("Mealie Detail Card: Double tap action triggered", actionConfig);
    } else if (!actionConfig && hold && config.hold_action) {
      actionConfig = config.hold_action;
      console.log("Mealie Detail Card: Hold action triggered", actionConfig);
    } else if (!actionConfig && !hold && config.tap_action) {
      actionConfig = config.tap_action;
      console.log("Mealie Detail Card: Tap action triggered", actionConfig);
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



customElements.define("mealie-detail-card", MealieDetailCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "mealie-detail-card",
  name: "Mealie Detail Card",
  description: "Zeigt Rezeptanweisungen von Mealie an.",
  preview: true,
});


window.addEventListener('resize', MealieDetailCard.getCarouselPositions);
