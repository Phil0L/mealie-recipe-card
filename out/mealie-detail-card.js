class MealieDetailCard extends HTMLElement{static getConfigForm(){return{schema:[{name:"mealie_instance",required:!0,selector:{config_entry:{integration:"mealie"}}},{name:"mealie_host",required:!1,selector:{text:{}}},{name:"recipe_id",required:!0,selector:{text:{}}},{name:"todo_list_entity",required:!1,selector:{entity:{domain:"todo"}}},{name:"design",type:"expandable",flatten:!0,icon:"mdi:palette",schema:[{name:"show_description",selector:{boolean:{}}},{name:"show_navigation",selector:{boolean:{}}},{name:"show_scrollbar",selector:{boolean:{}}},{name:"show_open_original",selector:{boolean:{}}},{name:"show_open_mealie",selector:{boolean:{}}}]},{name:"interactions",type:"expandable",flatten:!0,icon:"mdi:gesture-tap",schema:[{name:"tap_action",selector:{ui_action:{default_action:"none"}}},{name:"",type:"optional_actions",flatten:!0,schema:["hold_action","double_tap_action"].map(a=>({name:a,selector:{ui_action:{default_action:"none"}}}))}]},{name:"custom_button",type:"expandable",flatten:!1,icon:"mdi:play-circle-outline",schema:[{name:"icon",required:!1,selector:{icon:{}}},{name:"tap_action",required:!1,selector:{ui_action:{default_action:"none"}}}]}],computeLabel:a=>{switch(a.name){case"mealie_instance":return"Mealie instance";case"mealie_host":return"Mealie host (optional)";case"recipe_id":return"Recipe ID";case"todo_list_entity":return"Todo list entity (optional)";case"show_description":return"Show description";case"show_navigation":return"Show navigation buttons";case"show_scrollbar":return"Show horizontal scrollbar";case"show_open_original":return"Show open original recipe button ";case"show_open_mealie":return"Show open in Mealie button";default:return""}},computeHelper:a=>{switch(a.name){case"mealie_instance":return"The Mealie instance to display recipies from";case"mealie_host":return"The host of the Mealie instance (optional, required for loading images, e.g., http://localhost:9000)";case"recipe_id":return"The UUID of the recipe to display (format: 4256b18c-d25d-4f4f-86fe-6b815c4d1cef)";case"todo_list_entity":return"Optionally specify a todo list entity to add ingredients to when clicking the add to list button";case"show_description":return"Show the recipe description in the title card";case"show_navigation":return"Show next/previous buttons for navigating between instructions";case"show_scrollbar":return"Show scrollbar on instructions (for scrolling on desktop devices)";case"show_open_original":return"Show button to open the original recipe URL in a new tab";case"show_open_mealie":return"Show button to open the recipe in Mealie in a new tab (only if mealie_host is configured)";default:return""}},assertConfig:a=>{if(!a.mealie_instance)return void console.warn("Mealie Card: The Mealie instance is required");if(!a.recipe_id)return void console.warn("Mealie Card: The recipe ID is required");if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.recipe_id))return void console.warn("Mealie Card: The recipe ID must be a valid UUID")}}}static getStubConfig(){return{mealie_instance:"none",mealie_host:"",recipe_id:"",tap_action:{action:"none"},show_description:!0,show_navigation:!0,show_scrollbar:!0}}shouldUpdate(){return this.recipe===void 0||this.recipe.id!==this.config.recipe_id||this.skeleton}render(){return this.content||(this.innerHTML=`
        <ha-card class="card fit-rows recipe" style="cursor: pointer; overflow: hidden; display: flex; flex-direction: column; width: 100%">
          <h1 class="card-header" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 32px;">${this.skeleton?"Rezeptname":this.recipe.name}</h1>
          <div class="card-content" style="padding: 0px; width: 100%; flex-basis: -webkit-fill-available; max-height: calc(100% - 48px);"></div>
        </ha-card>
      `,this.content=this.querySelector(".card-content"),this.haCard=this.querySelector("ha-card")),this.recipe||this.skeleton?(this.content.innerHTML=`
        <style id="mealie-card-styles"></style>
        <div class="carousel slider" style="padding: 0px; width: 100%; height: 100%; text-align: center; overflow: hidden;">
          <div class="slides" ${this.config.show_scrollbar?"":"style=\"scrollbar-width: none; -ms-overflow-style: none;\""}">
            <div class="slide" id="slide-1">
              <div class="slide-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; padding: 16px; box-sizing: border-box;">
                <img src="${this._get_image_url()}" alt="${this.skeleton?"Recipe image":this.recipe.name}" style="width: 100%; height: 100px; border-radius: 10px; flex-grow:1; object-fit: cover;">
                ${this.config.show_description?`
                <p style="margin: 0; text-align: start; margin-top: 16px;">${this.skeleton?"Short description of the recipe...":this.recipe.description}</p>
                `:""}
                <div style="display: flex; flex-direction: row; align-items: center; flex-grow: 0; flex-wrap: wrap; gap: 8px; justify-content: center; ${this.config.show_navigation?"margin: 16px 48px 0 48px;":"margin: 16px 0 0 0;"}">
                  ${this.recipe&&this.recipe.original_url&&this.config.show_open_original?`<ha-control-button class="press-button original-link-button">
                    <ha-icon icon="mdi:open-in-new"></ha-icon>
                  </ha-control-button>`:""}
                  ${this.config.mealie_host&&this.recipe.slug&&this.config.show_open_mealie?`<ha-control-button class="press-button mealie-button">
                    <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
                  </ha-control-button>`:""}
                  <ha-control-button class="press-button next-button start-button" style="min-width: 120px;">Start cooking</ha-control-button>
                  ${this.config.todo_list_entity?`<ha-control-button class="press-button todo-button">
                    <ha-icon icon="mdi:playlist-plus"></ha-icon>
                  </ha-control-button>`:""}
                  ${this.config.custom_button&&this.config.custom_button.icon?`<ha-control-button class="press-button custom-button">
                    <ha-icon icon="${this.config.custom_button.icon}"></ha-icon>
                  </ha-control-button>`:""}
                </div>
              </div>
            </div>
            <div class="slide" id="slide-2">
              <div class="slide-content" style="display: flex; flex-direction: column; align-items: start; height: 100%; width: 100%; padding: 4px 16px 64px 16px; box-sizing: border-box; overflow-y: scroll;">
                <h2 style="margin: 0 0 8px 0; min-height: 32px;">Ingredients:</h2>
                ${this.skeleton?"":this.recipe.ingredients.map(a=>`<p style="margin: 0 0 2px 0;">${a.display}</p>`).join("")}
              </div>
            </div>
            ${this.skeleton?"":this.recipe.instructions.map((a,b)=>`<div class="slide" id="slide-${b+3}">
                <div class="slide-content" style="display: flex; flex-direction: column; align-items: start; height: 100%; width: 100%; padding: 4px 16px 64px 16px; box-sizing: border-box; overflow-y: scroll;">
                  <h2 style="margin: 0 0 8px 0; min-height: 32px;">Step ${b+1}: ${a.title?a.title:""}</h2>
                  <p style="margin: 0; text-align: start;">${a.text}</p>
                </div>
              </div>`).join("")}
            <div class="slide" id="slide-${this.skeleton?3:this.recipe.instructions.length+3}" style="font-size: 300%;">
              Enjoy!
            </div>
          </div>
          ${this.config.show_navigation?`
          <ha-control-button class="press-button next-button" style="position: absolute; bottom: 16px; right: 16px;">\>\></ha-control-button>
          <ha-control-button class="press-button previous-button" style="position: absolute; bottom: 16px; left: 16px; display: none;">\<\<</ha-control-button>
          `:""}
        </div>
      `,this.querySelector("#mealie-card-styles").innerHTML=`
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
      `,!this.skeleton&&this.apply_event_handlers()):this.recipe_loading?this.content.innerHTML=`<p>Lade Rezept...</p>`:this.content.innerHTML=`<p>Kein Rezept verfügbar.</p>`,this.innerHTML}_go_carousel(a){var b=[],c=this.querySelector(".slides").scrollLeft,d=c+this.querySelector(".slides").offsetWidth,e=this.querySelector(".slides").offsetWidth/2;if(this.querySelectorAll(".slide").forEach(function(a){b.push([a.offsetLeft,a.offsetLeft+a.offsetWidth])}),0===c&&"next"===a)this.currentItem=1;else if(d===this.querySelector(".slides").scrollWidth&&"previous"===a)console.log("here"),this.currentItem=b.length-2;else for(var f=c+e,g=0;g<b.length;g++)f>b[g][0]&&f<b[g][1]&&(this.currentItem=g,"next"===a?this.currentItem++:"previous"===a?this.currentItem--:parseInt(a)&&(this.currentItem=parseInt(a)));b[this.currentItem]&&this.querySelector(".slides").scrollTo({left:b[this.currentItem][0],behavior:"smooth"})}apply_event_handlers(){this.querySelector(".recipe").addEventListener("click",a=>(null!==this.presstimer&&(clearTimeout(this.presstimer),this.presstimer=null),this.longpress?(this.longpress=!1,!1):void(1===a.detail&&(this.dbltimer=setTimeout(()=>{this.handleClick(this,this._hass,this.config,!1,!1)},200))))),this.querySelector(".recipe").addEventListener("dblclick",()=>{clearTimeout(this.dbltimer),this.handleClick(this,this._hass,this.config,!1,!0)}),this.querySelector(".recipe").addEventListener("mousedown",a=>{"click"===a.type&&0!==a.button||null===this.presstimer&&(this.presstimer=setTimeout(()=>{this.longpress=!0,this.handleClick(this,this._hass,this.config,!0,!1)},1e3))}),this.querySelector(".recipe").addEventListener("touchstart",a=>{"click"===a.type&&0!==a.button||null===this.presstimer&&(this.presstimer=setTimeout(()=>{this.longpress=!0,this.handleClick(this,this._hass,this.config,!0,!1)},1e3))}),this.querySelector(".recipe").addEventListener("mouseout",()=>{null!==this.presstimer&&(clearTimeout(this.presstimer),this.presstimer=null)}),this.querySelector(".recipe").addEventListener("touchend",()=>{null!==this.presstimer&&(clearTimeout(this.presstimer),this.presstimer=null)}),this.querySelector(".recipe").addEventListener("touchleave",()=>{null!==this.presstimer&&(clearTimeout(this.presstimer),this.presstimer=null)}),this.querySelector(".recipe").addEventListener("touchcancel",()=>{null!==this.presstimer&&(clearTimeout(this.presstimer),this.presstimer=null)}),this.querySelectorAll(".next-button").forEach(a=>{a.addEventListener("click",a=>{this._go_carousel("next"),a.stopPropagation()})}),this.querySelectorAll(".previous-button").forEach(a=>{a.addEventListener("click",a=>{this._go_carousel("previous"),a.stopPropagation()})}),this.querySelectorAll(".slide-link").forEach((a,b)=>{a.addEventListener("click",a=>{this._go_carousel(b),a.stopPropagation()})}),this.querySelectorAll(".next-button").forEach(a=>{a.addEventListener("mousedown",a=>{a.stopPropagation()})}),this.querySelectorAll(".previous-button").forEach(a=>{a.addEventListener("mousedown",a=>{a.stopPropagation()})}),this.querySelectorAll(".slide-link").forEach(a=>{a.addEventListener("mousedown",a=>{a.stopPropagation()})}),this.querySelectorAll(".next-button").forEach(a=>{a.addEventListener("dblclick",a=>{a.stopPropagation()})}),this.querySelectorAll(".previous-button").forEach(a=>{a.addEventListener("dblclick",a=>{a.stopPropagation()})}),this.querySelectorAll(".slide-link").forEach(a=>{a.addEventListener("dblclick",a=>{a.stopPropagation()})}),this.querySelector(".slides").addEventListener("scroll",()=>{var a=[],b=this.querySelector(".slides").scrollLeft,c=this.querySelector(".slides").offsetWidth/2;this.querySelectorAll(".slide").forEach(function(b){a.push([b.offsetLeft,b.offsetLeft+b.offsetWidth])});for(var d=b+c,e=0;e<a.length;e++)d>a[e][0]&&d<a[e][1]&&(this.currentItem=e);this.currentItem>=a.length-1?this.querySelectorAll(".next-button").forEach(a=>{a.style.display="none"}):this.querySelectorAll(".next-button").forEach(a=>{a.style.display="block"}),1>this.currentItem?this.querySelectorAll(".previous-button").forEach(a=>{a.style.display="none"}):this.querySelectorAll(".previous-button").forEach(a=>{a.style.display="block"})}),this.querySelectorAll(".todo-button").forEach(a=>{a.addEventListener("click",a=>{a.stopPropagation();this.config.todo_list_entity&&this.recipe&&this.recipe.ingredients&&this.recipe.ingredients.forEach(a=>{this.handleClick(this,this._hass,this.config,!1,!1,{action:"call-service",service:"todo.add_item",service_data:{item:a.display},target:{entity_id:this.config.todo_list_entity}})})})}),this.querySelectorAll(".custom-button").forEach(a=>{a.addEventListener("click",a=>{a.stopPropagation();this.config.custom_button&&this.config.custom_button.action&&this.handleClick(this,this._hass,this.config,!1,!1,this.config.custom_button.action)})}),this.querySelectorAll(".original-link-button").forEach(a=>{a.addEventListener("click",a=>(a.stopPropagation(),!this.skeleton&&this.recipe&&this.recipe.original_url?void window.open(this.recipe.original_url,"_blank"):void console.warn("Mealie Detail Card: Original URL not available")))}),this.querySelectorAll(".mealie-button").forEach(a=>{a.addEventListener("click",a=>(a.stopPropagation(),!this.skeleton&&this.config.mealie_host&&this.recipe?void window.open(`${this.config.mealie_host||"http://localhost:9000"}/g/home/r/${this.recipe.slug}`,"_blank"):void console.warn("Mealie Detail Card: Mealie host or recipe not available")))})}set hass(a){return console.log("Mealie Detail Card: Setting hass instance"),this._hass=a,this.skeleton?void this.render():void(!this.recipe&&!this.recipe_loading&&(this.recipe_loading=!0,this._async_get_recipe(this.config.mealie_instance,this.config.recipe_id).then(a=>a?void(console.log("Mealie Detail Card: Loaded recipe",a),this.recipe_loading=!1,this.recipe=a,this.render()):void(this.recipe_loading=!1))))}get hass(){return this._hass}setConfig(a){if(!a)throw new Error("Invalid configuration: config is required");if(this.skeleton="none"===a.mealie_instance,this.skeleton)return console.log("Mealie Detail Card: Skeleton mode enabled"),this.config=a,void(this.recipe={id:a.recipe_id,name:"name",rating:4,total_time:"45 min"});if(!a.mealie_instance)throw new Error("Invalid configuration: 'mealie_instance' is required");if(!a.recipe_id)throw new Error("Invalid configuration: 'recipe_id' is required");if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.recipe_id)&&""!==a.recipe_id)throw new Error("Invalid configuration: 'recipe_id' must be a valid UUID (e.g., 4256b18c-d25d-4f4f-86fe-6b815c4d1cef)");this.config=a}async _async_get_recipe(a,b){if(this.skeleton)return void console.log("Mealie Detail Card: Skeleton mode enabled, skipping recipe load");if(!this._hass)return void console.error("Mealie Detail Card: Home Assistant instance not available");const c="mealie",d="get_recipe";try{const e=await this._hass.callService(c,d,{config_entry_id:a,recipe_id:b},{},!0,!0);return e.response.recipe}catch(a){console.error(`Mealie Detail Card: Failed to call service ${c}.${d}:`,a)}}_get_image_url(){return this.skeleton?"http://picsum.photos/id/292/3852/2556":`${this.config.mealie_host||"http://localhost:9000"}/api/media/recipes/${this.config.recipe_id}/images/min-original.webp`}getCardSize(){return 4}getGridOptions(){return{rows:6,columns:24,min_columns:6,min_rows:3}}handleClick(a,b,c,d,e,f=null){if(!f&&e&&c.double_tap_action?(f=c.double_tap_action,console.log("Mealie Detail Card: Double tap action triggered",f)):!f&&d&&c.hold_action?(f=c.hold_action,console.log("Mealie Detail Card: Hold action triggered",f)):!f&&!d&&c.tap_action&&(f=c.tap_action,console.log("Mealie Detail Card: Tap action triggered",f)),f||(f={action:"more-info"}),!f.confirmation||f.confirmation.exemptions&&f.confirmation.exemptions.some(a=>a.user===b.user.id)||confirm(f.confirmation.text||`Are you sure you want to ${f.action}?`))switch(f.action){case"more-info":(f.entity||c.entity||c.camera_image)&&(this.fireEvent(a,"hass-more-info",{entityId:f.entity?f.entity:c.entity?c.entity:c.camera_image}),f.haptic&&this.forwardHaptic(f.haptic));break;case"navigate":f.navigation_path&&(this.navigate(a,f.navigation_path),f.haptic&&this.forwardHaptic(f.haptic));break;case"url":f.url_path&&window.open(f.url_path),f.haptic&&this.forwardHaptic(f.haptic);break;case"toggle":c.entity&&(toggleEntity(b,c.entity),f.haptic&&this.forwardHaptic(f.haptic));break;case"call-service":{if(!f.service)return;const[a,d]=f.service.split(".",2),e={...f.service_data};"entity"===e.entity_id&&(e.entity_id=c.entity),b.callService(a,d,e,f.target),f.haptic&&this.forwardHaptic(f.haptic);break}case"perform-action":{if(!f.perform_action)return;const[a,d]=f.perform_action.split(".",2),e={...f.data};"entity"===e.entity_id&&(e.entity_id=c.entity),b.callService(a,d,e,f.target),f.haptic&&this.forwardHaptic(f.haptic);break}case"fire-dom-event":{this.fireEvent(a,"ll-custom",f),f.haptic&&this.forwardHaptic(f.haptic);break}}}fireEvent(a,b,c,d){d=d||{},c=null===c||void 0===c?{}:c;const e=new Event(b,{bubbles:void 0===d.bubbles||d.bubbles,cancelable:!!d.cancelable,composed:void 0===d.composed||d.composed});return e.detail=c,a.dispatchEvent(e),e}forwardHaptic(a){this.fireEvent(window,"haptic",a)}navigate(a,b,c=!1){c?history.replaceState(null,"",b):history.pushState(null,"",b),this.fireEvent(window,"location-changed",{replace:c})}}customElements.define("mealie-detail-card",MealieDetailCard),window.customCards=window.customCards||[],window.customCards.push({type:"mealie-detail-card",name:"Mealie Detail Card",description:"Zeigt Rezeptanweisungen von Mealie an.",preview:!0}),window.addEventListener("resize",MealieDetailCard.getCarouselPositions);