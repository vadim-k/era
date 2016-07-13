(function ($) {

  Drupal.behaviors.era = {
    attach: function(context, settings) {
      var era = Drupal.behaviors.era;
      var fields = $('.form-wrapper .era-field');
      if (fields.length) {
        fields.each(function() {
          var field = $(this);
          var contextField = field.closest('.form-wrapper');
          var fieldWrapper = field.parent().parent();
          fieldWrapper.once('era-field-wrapper', function() {
            era.attachLinks(field, contextField, fieldWrapper);
            era.bindField();
            era.bindContextField();
          });
        });
        $('body').once('era-body', function() {
          era.bindClearLink();
          era.bindColorbox();
        });
        era.updateFields(fields);
      }
    },

    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    attachLinks: function(field, contextField, fieldWrapper) {
      var era = Drupal.behaviors.era;
      var fieldData = era.getFieldData(field);
      var entityId = fieldData.entity_id;
      var title = fieldData.title;
      var imgSrc = fieldData.img_src;
      var img = '';
      var viewPath = field.data('view_path');
      var addPath = field.data('add_path');
      var editPath = '#';
      var contextFieldId = contextField.attr('id'); // id of entiryreference field
      var fieldId = field.attr('id'); // id of input field
      var referenceType = field.data('reference_type');
      viewPath += '/' + referenceType + '/' + contextFieldId;
      var links = '';
      if (typeof imgSrc != 'undefined' && imgSrc) {
        img = '<img src="' + imgSrc + '">';
      }
      if (entityId) {
        editPath = era.getEditPath(referenceType, entityId);
      }
      var thumbnail = '<span class="era-image">' + img + '</span>';
      var attachLink = '<a data-page_type="view" data-context_field_id="' + contextFieldId + '" data-reference_type="' + referenceType + '" class="era-field-link attach-link colorbox-link" href="' + viewPath + '">Attach</a>';
      var editLink = '<a data-page_type="edit" data-context_field_id="' + contextFieldId + '" data-reference_type="' + referenceType + '" class="era-field-link edit-link colorbox-link" href="' + editPath + '">Edit</a>';
      var addLink = '<a data-page_type="add" data-context_field_id="' + contextFieldId + '" data-reference_type="' + referenceType + '" class="era-field-link colorbox-link add-link" href="' + addPath + '">Add</a>';
      var clearLink = '<a class="era-field-link clear-link" href="#">Clear</a>';
      links += attachLink;
      if (addPath && addPath != '#') {
        links += addLink;
      }
      links += editLink;
      links += clearLink;
      fieldWrapper.append('<div class="era-field-links">' + links + '</div>');
      $(thumbnail).insertBefore(field);
      fieldWrapper.addClass('era-field-wrapper');
      contextField.addClass('era-fields-wrapper');
      if (!entityId) {
        era.hideLinks(fieldWrapper);
      }
      else {
        era.showLinks(fieldWrapper);
      }
    },

    bindField: function() {
      var era = Drupal.behaviors.era;
      $('.era-field').off('setField').on('setField', function(e) {
        var field = $(this);
        var referenceType = field.data('reference_type');
        var fieldWrapper = field.closest('.era-field-wrapper');
        var setInput = true;
        if (typeof e.set_input != 'undefined' && e.set_input == false) {
          setInput = false;
        }
        else {
          field.removeData('oldVal');
        }
        if (setInput) {
          $(this).val(e.title + ' (' + e.entity_id + ')');
        }
        var editPath = era.getEditPath(referenceType, e.entity_id);
        fieldWrapper.find('.edit-link').attr('href', editPath);
        era.showLinks(fieldWrapper);
        if (typeof e.img_src != 'undefined') {
          fieldWrapper.find('.era-image').empty().html('<img src="' + e.img_src + '" />');
        }
        era.setFieldData(field, {
          entity_id: e.entity_id,
          reference_type: e.reference_type,
          title: e.title,
          img_src: e.img_src,
        });
      });

      $('.era-field').off('clearField').on('clearField', function(e) {
        var field = $(this);
        var fieldWrapper = $(this).closest('.era-field-wrapper');
        var setInput = true;
        if (typeof e.set_input != 'undefined' && e.set_input == false) {
          setInput = false;
        }
        if (setInput) {
          field.val('');
        }
        fieldWrapper.find('.era-image').empty();
        fieldWrapper.find('.edit-link').attr('href', '#');
        era.hideLinks(fieldWrapper);
      });
    },

    bindContextField: function() {
      var era = Drupal.behaviors.era;
      $('.era-fields-wrapper').off('attachField').on('attachField', function(e) {
        era.attachItem({
          contextField: $(this),
          reference_type: e.reference_type,
          entity_id: e.entity_id,
          title: e.title,
          img_src: e.img_src
        });
      });
    },

    bindColorbox: function() {
      $('.form-wrapper').on('click', '.era-field-wrapper .colorbox-link', function() {
        event.stopPropagation();
        event.preventDefault();
        if ($.isFunction($.colorbox)) {
          if ($(this).hasClass('colorbox-link')) {
            var _href = $(this).attr('href');
            if (_href != '#' && _href != '') {
              var href = _href  + (_href.indexOf('?') != -1 ? "&" : "?") + 'colorbox_page=1';
              href += '&page_type=' + $(this).data('page_type');
              href += '&context_field_id=' + $(this).data('context_field_id');
              href += '&reference_type=' + $(this).data('reference_type');
              $.colorbox({
                href: href,
                width: "95%",
                height: "90%",
                opacity: '.7',
                fixed: true,
                iframe: true,
                scrolling: $(this).data('scrolling')
              });
            }
          }
        }
      });
    },

    bindClearLink: function() {
      $('.form-wrapper').on('click', '.era-field-wrapper .clear-link', function() {
        event.stopPropagation();
        event.preventDefault();
        var field = $(this).closest('.era-field-wrapper').find('.era-field');
        field.trigger({
          type: 'clearField'
        });
      });
    },

    getEditPath(referenceType, entityId) {
      var editPath = '#'
      switch (referenceType) {
        case 'node':
          editPath = Drupal.settings.basePath + 'node/' + entityId + '/edit';
          break;
        case 'taxonomy_term':
          editPath = Drupal.settings.basePath + 'taxonomy/term/' + entityId + '/edit';
          break;
        case 'file':
          editPath = Drupal.settings.basePath + 'file/' + entityId + '/edit';
          break;
        case 'user':
          editPath = Drupal.settings.basePath + 'user/' + entityId + '/edit';
          break;
      }
      return editPath;
    },

    hideLinks: function(fieldWrapper) {
      fieldWrapper.find('.era-field-link').hide();
      fieldWrapper.find('.attach-link').show();
      fieldWrapper.find('.add-link').show();
    },

    showLinks: function(fieldWrapper) {
      fieldWrapper.find('.era-field-link').show();
      fieldWrapper.find('.attach-link').hide();
      fieldWrapper.find('.add-link').hide();
    },

    getFieldData: function(field) {
      var data = {}
      var era = Drupal.behaviors.era;
      var entityId = era.getFieldEntityId(field);
      var referenceType = field.data('reference_type');
      for (var i in Drupal.settings.era.items) {
        var item = Drupal.settings.era.items[i];
        if (item.entity_id == entityId && item.reference_type == referenceType) {
          data = Drupal.settings.era.items[i];
          data.entity_id = entityId;
          break;
        }
      }
      return data;
    },

    removeFieldData: function(field) {
      var era = Drupal.behaviors.era;
      var entityId = era.getFieldEntityId(field);
      var referenceType = field.data('reference_type');
      for (var i in Drupal.settings.era.items) {
        var item = Drupal.settings.era.items[i];
        if (item.entity_id == entityId && item.reference_type == referenceType) {
          Drupal.settings.era.items.splice(i, 1);
        }
      }
    },

    setFieldData: function(field, data) {
      var era = Drupal.behaviors.era;
      era.removeFieldData(field);
      Drupal.settings.era.items.push(data);
    },

    clearfield: function(field) {
      field.trigger({
        type: 'clearfield'
      });
    },

    itemIsAttached: function(item) {
      var era = Drupal.behaviors.era;
      var isAttached = false;
      item.contextField.find('.era-field:text[value!=""]').each(function() {
        var entityId = era.getFieldEntityId($(this));
        if (item.entity_id == entityId) {
          isAttached = true;
        }
      });
      return isAttached;
    },

    getFieldEntityId: function (field) {
      var era = Drupal.behaviors.era;
      var entityId;
      var parts = field.val().split('(');
      if (parts.length <= 1) {
        parts = field.val().split('[nid:');
      }
      if (parts.length > 1) {
        parts.reverse();
        entityId = parts[0].replace(')', '').replace(']', '').replace('"', '').trim();
        if (!era.isNumeric(entityId)) {
          entityId = '';
        }
      }
      return entityId;
    },

    getFieldImgSrc: function (field) {
      var era = Drupal.behaviors.era;
      var imgSrc;
      var img = field.parent().find('.era-image img');
      if (img.length > 0) {
        imgSrc = img.attr('src');
      }
      return imgSrc;
    },

    setField: function(item, field) {
      if (field.length > 0) {
        item.type = 'setField';
        field.trigger(item);
      }
    },

    clearErrors: function(item) {
      item.contextField.find('.era-field.error').removeClass('error');
      item.contextField.find('.messages.error').remove();
    },
    
    attachItem: function(item) {
      var era = Drupal.behaviors.era;
      if (!era.itemIsAttached(item)) {
        var addMoreButton = item.contextField.find('input.field-add-more-submit');
        era.clearErrors(item)
        if (addMoreButton.length > 0) {
          var addedEmptyField = this.addEmptyField(item);
          $.when(addedEmptyField).done(function(item, emptyField) {
            era.setField(item, emptyField);
          });
        }
        else {
          var emptyField = item.contextField.find('.era-field').filter(function() {
            return !this.value;
          }).filter(':first');
          era.setField(item, emptyField);
        }
      }
    },
    
    addAnotherItem: function(item) {
      var addMoreButton = item.contextField.find('input.field-add-more-submit');
      if (!addMoreButton.hasClass('progress')) {
        addMoreButton.trigger('mousedown');
      }
    },

    addEmptyField: function(item) {
      var t, i;
      var era = Drupal.behaviors.era;
      var dfd = new $.Deferred();
      if (era.itemIsAttached(item)) {
        dfd.reject(item);
        clearTimeout(t);
      }
      else {
        i = setInterval(function() {
          var emptyField = item.contextField.find('.era-field').filter(function() {
            return !this.value;
          }).filter(':first');
          if (emptyField.length > 0) {
            clearInterval(i);
            clearTimeout(t);
            dfd.resolve(item, emptyField);
          }
          else {
            if (item.contextField.find('.era-field.error').length > 0) {
              clearInterval(i);
              clearTimeout(t);
              dfd.reject(item);
            }
            else {
              era.addAnotherItem(item);
              clearTimeout(t);
            }
          }
        }, 200);

        // reject adding new field if it takes too long
        t = setTimeout(function() {
          clearTimeout(t);
          clearInterval(i);
          dfd.reject(item);
        }, 3000);
      }
      return dfd.promise();
    },

    updateFields: function(fields) {
      var era = Drupal.behaviors.era;
      if (fields.length > 0) {
        setInterval(function() {
          fields.each(function() {
            era.updateField($(this));
          });
        }, 100);
      }
    },

    updateField: function(field) {
      if (field.data('oldVal') != field.val()) {
        var era = Drupal.behaviors.era;
        var entityId = era.getFieldEntityId(field);

        field.data('oldVal', field.val());
        
        if (!entityId) {
          field.trigger({
            type: 'clearField',
            set_input: false
          });
          field.data('oldVal', field.val());
          return ;
        }
        var fieldData = era.getFieldData(field);
        
        if (fieldData.img_src) {
          fieldData.set_input = false;
          era.setField(fieldData, field);
          return ;
        }

        var referenceType = field.data('reference_type');

        field.data('processing', 1);
        jQuery.ajax({
          url: "/admin/entityreference_assistant/ajax/" + referenceType + '/' + entityId,
          type: "get",
          dataType: 'json',
          success: function(data, textStatus, jqXHR){
            var item = {
              reference_type: referenceType,
              title: data.title,
              entity_id: entityId,
              img_src: data.img_src,
              set_input: false
            }
            era.setField(item, field);
          },
          complete: function(jqXHR, textStatus) {
            field.removeData('processing');
          }
        });
      }
    }

  }
}(jQuery));
