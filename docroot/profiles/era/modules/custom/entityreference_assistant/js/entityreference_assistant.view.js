(function ($) {
  Drupal.behaviors.eraView = {
    attach: function(context, settings) {
      var eraView = Drupal.behaviors.eraView;
      var attachButton = '<input type="button" class="attach-items form-submit button-yes" value="Attach Selected Items" />';
      $('.view-content').append(attachButton);
      $('.view-content').prepend(attachButton);

      $('.view-content a').attr('target', '_blank');

      $('.view-content').on('click', '.grid-item, .views-row, .even, .odd', function(){
        if ($(this).hasClass('active')) {
          $(this).removeClass('active'); 
        }
        else {
          $(this).addClass('active'); 
        }
      });

      var contextFieldId = settings.eraView.context_field_id;
      var referenceType = settings.eraView.reference_type;

      $('.view-content').on('click', '.attach-items', function() {
        var activeRows = $('.view-content').find('.grid-item.active, .views-row.active, .even.active, .odd.active');
        if (activeRows.length == 0 ) {
          return false;
        }
        activeRows.each(function() {
          var entityId = $(this).find('.views-field-nid, .views-field-fid, .views-field-tid, .views-field-uid').first().text();
          var title = $(this).find('.views-field-title, .views-field-filename, .views-field-name').first().text();
          if (entityId) {
            entityId = eraView.trim(entityId);
          }
          if (title) {
            title = eraView.trim(title);
          }
          if (contextFieldId) {
            eraView.attachAssetField(contextFieldId, referenceType, entityId, title);
          }
        });
        parent.jQuery.fn.colorbox.close();
      });
    },

    trim: function(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    attachAssetField: function(contextFieldId, referenceType, entityId, title) {
      if (contextFieldId) {
        var field = parent.jQuery('#' + contextFieldId);
        if (field.length > 0) {
          field.trigger({
            type: 'attachField',
            reference_type: referenceType,
            entity_id: entityId,
            title: title
          });
        }
      }
    }
  }
}(jQuery));
