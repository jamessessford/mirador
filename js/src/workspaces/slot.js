(function($) {

  $.Slot = function(options) {

    jQuery.extend(true, this, {
      workspaceSlotCls: 'slot',
      slotID:           null,
      focused:          null,
      appendTo:         null,
      parent:           null,
      window:           null,
      windowElement:    null

    }, options);

    this.init();

  };

  $.Slot.prototype = {
    init: function () {
      this.element = jQuery(this.template({
        workspaceSlotCls: this.workspaceSlotCls,
        slotID: this.slotId 
      }));
      this.element.appendTo(this.appendTo);

      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;

      // Slot only subscribes under its own name,
      // so it will be the only one whose function is
      // called to create a window when the 
      // load menu is invoked from it.
      /*Query.subscribe('manifestToSlot.'+_this.slotID, function(e, windowConfig) { 
        _this.clearSlot();
        windowConfig.parent = _this;
        if (!_this.window && !windowConfig.id) {
           windowConfig.id = $.genUUID();
        }
        if (_this.window && !windowConfig.id) {
           windowConfig.id = _this.window.id;
        } 
        windowConfig.appendTo = _this.element;
        if (_this.window) {
          _this.window.update(windowConfig);
        } else {
          jQuery.publish("windowAdded", windowConfig.id);
          _this.window = new $.Window(windowConfig);
        }
      })*/
      
     console.log('added an event');
     this.element.find('.addItemLink').on('click', function(){ _this.addItem(); });
    },
    
    manifestToSlot: function(windowConfig) { 
        var _this = this;
        _this.clearSlot();
        windowConfig.parent = _this;
        if (!_this.window && !windowConfig.id) {
           windowConfig.id = $.genUUID();
        }
        if (_this.window && !windowConfig.id) {
           windowConfig.id = _this.window.id;
        } 
        windowConfig.appendTo = _this.element;
        if (_this.window) {
          _this.window.update(windowConfig);
        } else {
          jQuery.publish("windowAdded", windowConfig.id);
          _this.window = new $.Window(windowConfig);
        }
      },

    clearSlot: function() {
      if (this.window) { 
         this.window.element.toggle('fade', 300, function() {
           jQuery(this).remove();        
        });
      }
    },

    resize: function() {
      // notify the layout manager with
      // appropriate information.
    },
    
    addItem: function() {
      var _this = this;
      _this.parent.focused = true;
      _this.parent.addItem(_this.slotID);
    },

    // template should be based on workspace type
    template: Handlebars.compile([
                                 '<div id="{{slotID}}" class="{{workspaceSlotCls}}">',
                                 '<div class="slotIconContainer">',
                                 // '<a href="javascript:;" class="mirador-btn mirador-icon-window-menu" title="Replace object"><i class="fa fa-table fa-lg fa-fw"></i>',
                                 // '<ul class="dropdown slot-controls">',
                                 // '<li class="new-object-option"><i class="fa fa-plus-square fa-lg fa-fw"></i> New Object</li>',
                                 // '<li class="remove-object-option"><i class="fa fa-times fa-lg fa-fw"></i> Close</li>',
                                 // '<li class="add-slot-right"><i class="fa fa-caret-square-o-right fa-lg fa-fw"></i> Add Slot Right</li>',
                                 // '<li class="add-slot-left"><i class="fa fa-caret-square-o-left fa-lg fa-fw"></i> Add Slot Left</li>',
                                 // '<li class="add-slot-above"><i class="fa fa-caret-square-o-up fa-lg fa-fw"></i> Add Slot Above</li>',
                                 // '<li class="add-slot-below"><i class="fa fa-caret-square-o-down fa-lg fa-fw"></i> Add Slot Below</li>',
                                 // '</ul>',
                                 // '</a>',
                                 '<h1 class="plus">+</h1>',
                                 '<h1>Add Item</h1>',
                                 '</div>',
                                 '<a class="addItemLink"></a>',
                                 '</div>'
    ].join(''))
  };

}(Mirador));

