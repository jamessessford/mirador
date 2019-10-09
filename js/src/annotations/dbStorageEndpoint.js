/*
 * All Endpoints need to have at least the following:
 * annotationsList - current list of OA Annotations
 * dfd - Deferred Object
 * init()
 * search(options, successCallback, errorCallback)
 * create(oaAnnotation, successCallback, errorCallback)
 * update(oaAnnotation, successCallback, errorCallback)
 * deleteAnnotation(annotationID, successCallback, errorCallback) (delete is a reserved word)
 * TODO:
 * read() //not currently used
 *
 * Optional, if endpoint is not OA compliant:
 * getAnnotationInOA(endpointAnnotation)
 * getAnnotationInEndpoint(oaAnnotation)
 */
(function($){

    $.dbStorageEndpoint = function(options) {
  
      jQuery.extend(this, {
        token:     null,
        prefix:    null,
        dfd:       null,
        annotationsList: [],
        windowID: null,
        eventEmitter: null
      }, options);
  
      this.init();
    };
  
    $.dbStorageEndpoint.prototype = {
      //Set up some options for catch
      init: function() {
      },
  
      set: function(prop, value, options) {
        if (options) {
          this[options.parent][prop] = value;
        } else {
          this[prop] = value;
        }
      },
  
      //Search endpoint for all annotations with a given URI
      search: function(options, successCallback, errorCallback, stopAfterLookup) {
        var _this = this;
  
        if (typeof stopAfterLookup === "undefined") { stopAfterLookup = true; }

        if (stopAfterLookup)
        {
            this.annotationsList = []; //clear out current list
        }
  
  
        try {
          if (stopAfterLookup) {
              this.getAnnotationList(options.uri, options, successCallback, errorCallback);
              return false;
          }
  
          jQuery.each(_this.annotationsList, function(index, value) {
            value.endpoint = _this;
          });
          if (typeof successCallback === "function") {
            successCallback(_this.annotationsList);
          } else {
            _this.dfd.resolve(true);
          }
        } catch (e) {
          if (typeof errorCallback === "function") {
            errorCallback();
          } else {
            console.log("There was an error searching this endpoint");
          }
        }
      },
  
      deleteAnnotation: function(annotationID, successCallback, errorCallback) {
        var _this = this,
        keys = [];
        jQuery.each(_this.annotationsList[0].on, function(index, value) {
          if (jQuery.inArray(value.full, keys) === -1) {
            keys.push(value.full);
          }
        });
  
        if (keys.length === 0) {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
        jQuery.each(keys, function(index, key) {
          try {
            var keyc   = key.split('/');
            var _id    = keyc[keyc.length -1];
            //find the matching annotation in the array and update it
            _this.annotationsList = jQuery.grep(_this.annotationsList, function(value, index) {
              return value['@id'] !== annotationID;
            });
  
            //remove endpoint reference before JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              delete value.endpoint;
            });
  
            var _project = jQuery('[name=project-uuid]').val();
  
            jQuery.ajax({
              method: 'POST',
              url: '/project/' + _project + '/asset/' + _id + '/annotation',
              data: {
                _token: jQuery('[name=csrf-token]').attr('content'),
                asset: _id,
                anno: JSON.stringify(_this.annotationsList)
              },
              dataType: 'json',
              success: function(data) { jQuery(jQuery('[name=last-tool').val()).trigger('click');},
              error: function(err) {}
            });
  
            //add endpoint reference after JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              value.endpoint = _this;
            });
  
            if (typeof successCallback === "function") {
              successCallback();
            }
          } catch (e) {
            console.log(e);
            if (typeof errorCallback === "function") {
              errorCallback();
            }
          }
        });
      },
  
      update: function(oaAnnotation, successCallback, errorCallback) {
        var _this = this,
        annotationID = oaAnnotation['@id'],
        keys = [];
        jQuery.each(oaAnnotation.on, function(index, value) {
          if (jQuery.inArray(value.full, keys) === -1) {
            keys.push(value.full);
          }
        });
  
        if (keys.length === 0) {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
        jQuery.each(keys, function(index, key) {
          try {
  
            var keyc   = key.split('/');
            var _id    = keyc[keyc.length -1];
  
            //var lastColour  = jQuery('[name=last-colour]').val();
            var lastTool    = jQuery('[name=last-tool]').val();
  
            if (_this.annotationsList.length === 0) {
              //_this.annotationsList = _this.getAnnotationList(key);
            }
            //find the matching annotation in the array and update it
            // jQuery.each(_this.annotationsList, function(index, value) {
            //   if (value['@id'] === annotationID) {
            //     oaAnnotation['on'][0]['selector']['item']['value'] = oaAnnotation['on'][0]['selector']['item']['value'].replace(/\#00bfff/ig, lastColour);
            //     if (lastTool != '.mirador-osd-check_box_outline_blank-mode')
            //     {
            //         oaAnnotation['on'][0]['selector']['item']['value'] = oaAnnotation['on'][0]['selector']['item']['value'].replace('fill-opacity=\"0\"', 'fill-opacity=\".5\"');
            //     }
            //     _this.annotationsList[index] = oaAnnotation;
            //     return false;
            //   }
  
            // });
  
            //remove endpoint reference before JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              delete value.endpoint;
            });
  
            var leggist = JSON.stringify(_this.annotationsList);
  
            jQuery.ajax({
              method: 'POST',
              url: '/asset/' + _id + '/annotation',
              data: {
                _token: jQuery('[name=csrf-token]').attr('content'),
                asset: _id,
                anno: leggist
              },
              dataType: 'json',
              success: function(data) {jQuery(jQuery('[name=last-tool').val()).trigger('click');},
              error: function(err) {}
            });
  
            //add endpoint reference after JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              value.endpoint = _this;
            });
  
            if (typeof successCallback === "function") {
              successCallback(oaAnnotation);
            }
          } catch (e) {
            if (typeof errorCallback === "function") {
              errorCallback();
            }
          }
        });
      },
  
      //takes OA Annotation, gets Endpoint Annotation, and saves
      //if successful, MUST return the OA rendering of the annotation
      create: function(oaAnnotation, successCallback, errorCallback) {
        // console.log(oaAnnotation);
        // console.log(oaAnnotation.on[0].selector.default);
        //console.log(oaAnnotation.on.value.full);
  
        var _this = this,
        keys = [];
        jQuery.each(oaAnnotation.on, function(index, value) {
          if (jQuery.inArray(value.full, keys) === -1) {
            keys.push(value.full);
          }
        });
  
        //console.log(keys)
  
        if (keys.length === 0) {
          if (typeof errorCallback === "function") {
            errorCallback();
          }
        }
        jQuery.each(keys, function(index, key) {
          try {
            if (_this.annotationsList.length === 0) {
              //_this.annotationsList = _this.getAnnotationList(key);
            }
  
            var keyc   = key.split('/');
            var _id    = keyc[keyc.length -1];
  
            //var lastColour  = jQuery('[name=last-colour]').val();
            var lastTool    = jQuery('[name=last-tool]').val();
  
            oaAnnotation["@id"] = $.genUUID();
            //oaAnnotation['on'][0]['selector']['item']['value'] = oaAnnotation['on'][0]['selector']['item']['value'].replace(/\#00bfff/ig, lastColour);
            // if (lastTool != '.mirador-osd-check_box_outline_blank-mode')
            // {
            //     oaAnnotation['on'][0]['selector']['item']['value'] = oaAnnotation['on'][0]['selector']['item']['value'].replace('fill-opacity=\"0\"', 'fill-opacity=\".5\"');
            // }
  
            _this.annotationsList.push(oaAnnotation);
  
            //remove endpoint reference before JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              delete value.endpoint;
            });
  
            var _project = jQuery('[name=project-uuid]').val();
  
            var leggist = JSON.stringify(_this.annotationsList);
            jQuery.ajax({
              method: 'POST',
              url: '/project/' + _project +'/asset/' + _id + '/annotation',
              data: {
                _token: jQuery('[name=csrf-token]').attr('content'),
                asset: _id,
                anno: leggist
              },
              dataType: 'json',
              success: function(data) {jQuery(jQuery('[name=last-tool').val()).trigger('click');},
              error: function(err) {}
            });
  
  
            //localStorage.setItem(key, JSON.stringify(_this.annotationsList));
  
            //add endpoint reference after JSON.stringify
            jQuery.each(_this.annotationsList, function(index, value) {
              value.endpoint = _this;
            });
  
            if (typeof successCallback === "function") {
              successCallback(oaAnnotation);
            }
          } catch (e) {
            console.log(e);
            if (typeof errorCallback === "function") {
              errorCallback();
            }
          }
        });
      },
  
      getAnnotationList: function(key, options, successCallback, errorCallback) {
        
        console.log("Am I here?");
        
        var _this = this;
        var keyc   = key.split('/');
        var _id    = keyc[keyc.length -1];
  
        var _project = jQuery('[name=project-uuid]').val();
  
        list = [];
  
        jQuery.when(
          jQuery.ajax({
            method: 'GET',
            url: '/project/' + _project + '/asset/' + _id + '/annotation',
            dataType: 'json'
          })
        ).done(function(data){
          list  = (data.data ? JSON.parse(data.data) : []);
          _this.annotationsList = list;
          _this.search(options, successCallback, errorCallback, false);
          window.setTimeout(function(){
              jQuery('.mirador-osd-pointer-mode').trigger('click');
              window.setTimeout(function(){
                jQuery(jQuery('[name=last-tool').val()).trigger('click');
              }, 500);
          }, 500);
        });
      },
  
      userAuthorize: function(action, annotation) {
        return true;
      }
    };
  
  }(Mirador));
  