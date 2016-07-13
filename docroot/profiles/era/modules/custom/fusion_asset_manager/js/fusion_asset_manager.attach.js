(function ($) {

  Drupal.behaviors.fusionAssetManager = {
    attach: function(context, settings) {
      var am = Drupal.behaviors.fusionAssetManager;
      var assetFields = $('.form-wrapper .asset-field');
      if (assetFields.length > 0) {
        assetFields.each(function() {
          var assetField = $(this);
          var contextField = assetField.closest('.form-wrapper');
          var assetFieldWrapper = assetField.parent().parent();
          assetFieldWrapper.once('asset-field-wrapper', function() {
            am.attachLinks(assetField, contextField, assetFieldWrapper);
            am.bindAssetField();
            am.bindContextField();
          });
        });
        $('body').once('asset-manager', function() {
          am.bindClearLink();
          am.bindColorbox();
        });
        am.updateAssetFields(assetFields);
      }
    },

    attachLinks: function(assetField, contextField, assetFieldWrapper) {
      var am = Drupal.behaviors.fusionAssetManager;
      var info = Drupal.settings.fusionAssetManager.info;
      var fieldData = am.getFieldData(assetField);
      var entityId = fieldData.entityId;
      var title = fieldData.title;
      var imgSrc = fieldData.imgSrc;
      var img = '';
      var contextFieldId = contextField.attr('id'); // id of entiryreference field
      var contextAssetFeldId = assetField.attr('id'); // id of input field
      var assetType = assetField.data('asset_type');
      var attachPath = '#';
      var addPath = '#';
      var editPath = '#';
      var clonePath = '#';
      var buttons = '';
      var links = '';
      if (info[assetType]['attach_path']) {
        attachPath = info[assetType]['attach_path'];
      }
      if (info[assetType]['add_path']) {
        addPath = info[assetType]['add_path'];
      }
      if (entityId) {
        editPath = '/node/' + entityId + '/edit';
        clonePath = '/node/' + entityId + '/clone/confirm';
        if (info[assetType]['entity_type'] == 'taxonomy_term') {
          editPath = '/taxonomy/term/' + entityId + '/edit';
        }
        if (info[assetType]['entity_type'] == 'file') {
          editPath = '/file/' + entityId + '/edit';
        }
      }
      if (typeof imgSrc != 'undefined' && imgSrc) {
        img = '<img src="' + imgSrc + '">';
      }
      var thumbnail = '<span class="asset-image">' + img + '</span>';
      var attachLink = '<a data-context_field_id="' + contextAssetFeldId + '" data-asset_type="' + assetType + '" class="asset-field-link attach-link colorbox-link" href="' + attachPath + '">Attach</a>';
      var addLink = '<a data-context_field_id="' + contextFieldId + '" data-asset_type="' + assetType + '" class="asset-field-link colorbox-link add-link" href="' + addPath + '">Upload</a>';
      var editLink = '<a data-context_field_id="' + contextAssetFeldId + '" data-asset_type="' + assetType + '" class="asset-field-link edit-link colorbox-link" href="' + editPath + '">Edit</a>';
      var cloneLink = '<a data-context_field_id="' + contextAssetFeldId + '" data-asset_type="' + assetType + '" class="asset-field-link clone-link colorbox-link" href="' + clonePath + '">Clone</a>';
      var clearLink = '<a class="asset-field-link clear-link" href="#">Clear</a>';
      var attachButton = '<a data-context_field_id="' + contextFieldId + '" data-asset_type="' + assetType + '" class="asset-field-button colorbox-link attach-button" href="' + attachPath + '">Attach</a>';
      var addButton = '<a data-scrolling="0" data-context_field_id="' + contextFieldId + '" data-asset_type="' + assetType + '" class="asset-field-button colorbox-link add-button" href="' + addPath + '">Upload</a>';
      
      if (typeof info[assetType]['attach_button'] != "undefined" && info[assetType]['attach_button']) {
        buttons += attachButton;
      }
      if (info[assetType]['add_button']) {
        buttons += addButton;
      }
      if (info[assetType]['add_link']) {
        links += addLink;
      }
      if (info[assetType]['attach_link']) {
        links += attachLink;
      }
      if (info[assetType]['edit_link']) {
        links += editLink;
      }
      if (info[assetType]['clone_link']) {
        links += cloneLink;
      }
      if (info[assetType]['clear_link']) {
        links += clearLink;
      }
      if (buttons && contextField.find('.asset-field-buttons').length == 0) {
        assetFieldWrapper.append('<div class="asset-field-buttons">' + buttons + '</div>');
      }
      if (links) {
        assetFieldWrapper.append('<div class="asset-field-links">' + links + '</div>');
      }
      $(thumbnail).insertBefore(assetField);
      assetFieldWrapper.addClass('asset-field-wrapper');
      contextField.addClass('asset-fields-wrapper');
      if (!entityId) {
        am.hideLinks(assetFieldWrapper);
      }
      else {
        am.showLinks(assetFieldWrapper);
      }
    },

    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
    
    hideLinks: function(assetFieldWrapper) {
      assetFieldWrapper.find('.asset-field-link').hide();
      assetFieldWrapper.find('.attach-link').show();
      assetFieldWrapper.find('.add-link').show();
    },

    showLinks: function(assetFieldWrapper) {
      assetFieldWrapper.find('.asset-field-link').show();
      //assetFieldWrapper.find('.attach-link').hide();
    },

    getFieldData: function(assetField) {
      var data = {
        entityId: '',
        title: '',
        imgSrc: '',
      }
      var am = Drupal.behaviors.fusionAssetManager;
      var entityId = am.getFieldEntityId(assetField);
      var assetType = assetField.data('asset_type');
      for (var i in Drupal.settings.fusionAssetManager.items) {
        var item = Drupal.settings.fusionAssetManager.items[i];
        if (item.entityId == entityId && item.assetType == assetType) {
          data = Drupal.settings.fusionAssetManager.items[i];
          data.entityId = entityId;
          break;
        }
      }
      return data;
    },

    removeFieldData: function(assetField) {
      var am = Drupal.behaviors.fusionAssetManager;
      var entityId = am.getFieldEntityId(assetField);
      var assetType = assetField.data('asset_type');
      for (var i in Drupal.settings.fusionAssetManager.items) {
        var item = Drupal.settings.fusionAssetManager.items[i];
        if (item.entityId == entityId && item.assetType == assetType) {
          Drupal.settings.fusionAssetManager.items.splice(i, 1);
        }
      }
    },

    setFieldData: function(assetField, data) {
      var am = Drupal.behaviors.fusionAssetManager;
      am.removeFieldData(assetField);
      Drupal.settings.fusionAssetManager.items.push(data);
    },

    bindAssetField: function() {
      var am = Drupal.behaviors.fusionAssetManager;
      var info = Drupal.settings.fusionAssetManager.info;
      $('.asset-field').off('setAssetField').on('setAssetField', function(e) {
        var assetField = $(this);
        var assetType = assetField.data('asset_type');
        var assetFieldWrapper = assetField.closest('.asset-field-wrapper');
        var setInput = true;
        if (typeof e.setInput != 'undefined' && e.setInput == false) {
          setInput = false;
        }
        else {
          assetField.removeData('oldVal');
        }
        if (assetType == 'nodequeue') {
          if (setInput) {
            $(this).val(e.title + ' [nid: ' + e.entityId + ']');
          }
        }
        else {
          if (setInput) {
            $(this).val(e.title + ' (' + e.entityId + ')');
          }
          if (e.caption) {
            if (assetFieldWrapper.find('textarea.caption').val() == '') {
              assetFieldWrapper.find('textarea.caption').val(e.caption);
            }
          }
        }
        if (info[assetType]['edit_link']) {
          var editPath = '/node/' + e.entityId + '/edit';
          if (info[assetType]['entity_type'] == 'taxonomy_term') {
            editPath = '/taxonomy/term/' + e.entityId + '/edit';
          }
          if (info[assetType]['entity_type'] == 'file') {
            editPath = '/file/' + e.entityId + '/edit';
          }
          assetFieldWrapper.find('.edit-link').attr('href', editPath);
        }
        if (info[assetType]['clone_link']) {
          var clonePath = '/node/' + e.entityId + '/clone/confirm';
          assetFieldWrapper.find('.clone-link').attr('href', clonePath);
        }
        am.showLinks(assetFieldWrapper);
        if (typeof e.imgSrc != 'undefined') {
          assetFieldWrapper.find('.asset-image').empty().html('<img src="' + e.imgSrc + '" />');
        }
        am.setFieldData(assetField, {
          entityId: e.entityId,
          assetType: e.assetType,
          title: e.title,
          imgSrc: e.imgSrc,
          caption: e.caption
        });
      });

      $('.asset-field').off('clearAssetField').on('clearAssetField', function(e) {
        var assetField = $(this);
        var assetFieldWrapper = $(this).closest('.asset-field-wrapper');
        var setInput = true;
        if (typeof e.setInput != 'undefined' && e.setInput == false) {
          setInput = false;
        }
        if (setInput) {
          assetField.val('');
        }
        assetFieldWrapper.find('textarea.caption').val('');
        assetFieldWrapper.find('.asset-image').empty();
        assetFieldWrapper.find('.edit-link').attr('href', '#');
        assetFieldWrapper.find('.clone-link').attr('href', '#');
        am.hideLinks(assetFieldWrapper);
      });
    },

    bindContextField: function() {
      var am = Drupal.behaviors.fusionAssetManager;
      $('.asset-fields-wrapper').off('attachAssetField').on('attachAssetField', function(e) {
        am.attachItem({
          contextField: $(this),
          assetType: e.assetType,
          entityId: e.entityId,
          title: e.title,
          imgSrc: e.imgSrc
        });
      });
    },

    bindClearLink: function() {
      $('.form-wrapper').on('click', '.asset-field-wrapper .clear-link', function() {
        event.stopPropagation();
        event.preventDefault();
        var assetField = $(this).closest('.asset-field-wrapper').find('.asset-field');
        assetField.trigger({
          type: 'clearAssetField'
        });
      });
    },

    clearAssetField: function(assetField) {
      assetField.trigger({
        type: 'clearAssetField'
      });
    },

    bindColorbox: function() {
      $('.form-wrapper').on('click', '.asset-field-wrapper .colorbox-link', function() {
        event.stopPropagation();
        event.preventDefault();
        if ($.isFunction($.colorbox)) {
          if ($(this).hasClass('colorbox-link')) {
            var _href = $(this).attr('href');
            if (_href != '#' && _href != '') {
              $.colorbox({
                href: _href  + '/' + $(this).data('asset_type') + '/' + $(this).data('context_field_id') + (_href.indexOf('?') != -1 ? "&colorbox=1" : "?colorbox=1"),
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

    itemIsAttached: function(item) {
      var am = Drupal.behaviors.fusionAssetManager;
      var retVal = false;
      item.contextField.find('.asset-field:text[value!=""]').each(function() {
        var entityId = am.getFieldEntityId($(this));
        if (item.entityId == entityId) {
          retVal = true;
        }
      });
      return retVal;
    },

    getFieldEntityId: function (assetField) {
      var am = Drupal.behaviors.fusionAssetManager;
      var entityId;
      var parts = assetField.val().split('(');
      if (parts.length <= 1) {
        parts = assetField.val().split('[nid:');
      }
      if (parts.length > 1) {
        parts.reverse();
        entityId = parts[0].replace(')', '').replace(']', '').replace('"', '').trim();
        if (!am.isNumeric(entityId)) {
          entityId = '';
        }
      }
      return entityId;
    },

    getFieldImgSrc: function (assetField) {
      var am = Drupal.behaviors.fusionAssetManager;
      var imgSrc;
      var img = assetField.parent().find('.asset-image img');
      if (img.length > 0) {
        imgSrc = img.attr('src');
      }
      return imgSrc;
    },

    setAssetField: function(item, assetField) {
      if (assetField.length > 0) {
        item.type = 'setAssetField';
        assetField.trigger(item);
      }
    },

    clearErrors: function(item) {
      item.contextField.find('.asset-field.error').removeClass('error');
      item.contextField.find('.messages.error').remove();
    },
    
    attachItem: function(item) {
      var am = Drupal.behaviors.fusionAssetManager;
      if (!am.itemIsAttached(item)) {
        var addMoreButton = item.contextField.find('input.field-add-more-submit');
        am.clearErrors(item)
        if (addMoreButton.length > 0) {
          var addedEmptyField = this.addEmptyField(item);
          $.when(addedEmptyField).done(function(item, emptyField) {
            am.setAssetField(item, emptyField);
          });
        }
        else {
          var emptyField = item.contextField.find('.asset-field:text[value=""]').filter(':first');
          am.setAssetField(item, emptyField);
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
      var am = Drupal.behaviors.fusionAssetManager;
      var dfd = new $.Deferred();
      if (am.itemIsAttached(item)) {
        dfd.reject(item);
        clearTimeout(t);
      }
      else {
        var i = setInterval(function() {
          var emptyField = item.contextField.find('.asset-field:text[value=""]').filter(':first');
          if (emptyField.length > 0) {
            clearInterval(i);
            clearTimeout(t);
            dfd.resolve(item, emptyField);
          }
          else {
            if (item.contextField.find('.asset-field.error').length > 0) {
              clearInterval(i);
              clearTimeout(t);
              dfd.reject(item);
            }
            else {
              am.addAnotherItem(item);
              clearTimeout(t);
            }
          }
        }, 200);

        // reject adding new field if it takes too long
        var t = setTimeout(function() {
          clearTimeout(t);
          clearInterval(i);
          dfd.reject(item);
        }, 3000);
      }
      return dfd.promise();
    },

    updateAssetFields: function(assetFields) {
      var am = Drupal.behaviors.fusionAssetManager;
      if (assetFields.length > 0) {
        setInterval(function() {
          assetFields.each(function() {
            am.updateAssetField($(this));
          });
        }, 100);
      }
    },

    updateAssetField: function(assetField) {
      if (assetField.data('oldVal') != assetField.val()) {
        var am = Drupal.behaviors.fusionAssetManager;
        var asseFieldEntityId = am.getFieldEntityId(assetField);
        var referenceEntityId = Drupal.settings.fusionAssetManager.reference_entity_id;
        var referenceEntityType = Drupal.settings.fusionAssetManager.reference_entity_type;

        if (!referenceEntityId) {
          referenceEntityId = '0';
        }
        if (!referenceEntityType) {
          referenceEntityType = '0';
        }

        assetField.data('oldVal', assetField.val());
        
        if (!asseFieldEntityId) {
          assetField.trigger({
            type: 'clearAssetField',
            setInput: false
          });
          assetField.data('oldVal', assetField.val());
          return ;
        }

        var fieldData = am.getFieldData(assetField);
        
        if (fieldData.imgSrc) {
          fieldData.setInput = false;
          am.setAssetField(fieldData, assetField);
          return ;
        }

        var assetType = assetField.data('asset_type');

        assetField.data('processing', 1);
        jQuery.ajax({
          url: "/admin/assets/ajax/" + assetType + '/' + asseFieldEntityId + '/' + referenceEntityId + '/' + referenceEntityType,
          type: "get",
          dataType: 'json',
          success: function(data, textStatus, jqXHR){
            var item = {
              assetType: assetType,
              title: data.title,
              entityId: asseFieldEntityId,
              imgSrc: data.imgSrc,
              caption: data.caption,
              setInput: false
            }
            am.setAssetField(item, assetField);
          },
          complete: function(jqXHR, textStatus) {
            assetField.removeData('processing');
          }
        });
      }
    }
  }
  
}(jQuery));