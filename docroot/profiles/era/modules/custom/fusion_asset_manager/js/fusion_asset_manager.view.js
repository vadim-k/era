(function ($) {
  Drupal.behaviors.fusionAssetManagerView = {
    attach: function(context, settings) {
      var am = Drupal.behaviors.fusionAssetManagerView;
      var contextFieldId = settings.fusionAssetManagerView.contextFieldId;
      var assetType = settings.fusionAssetManagerView.assetType;
      var entityType = settings.fusionAssetManagerView.entityType;
      $('th:nth-child(2)').append('<input id="embed_images" type="button" class="form-submit" value="Attach Selected Items" />');

      $('table').on('click', 'td a', function() {
        event.preventDefault();
        return false;
      });
      
      $('table.views-table tbody').on('click', 'tr', function(){
        if ($(this).hasClass('active')) {
          $(this).removeClass('active'); 
        }
        else {
          $(this).addClass('active'); 
        }
      });
      
      $('table').on('click', '#embed_images', function() {
        var activeRows = $('table.views-table tr.active');
        if (activeRows.length == 0 ) {
          return false;
        }
        activeRows.each(function() {
          var entityId = $(this).find('td.views-field-nid, td.views-field-fid, td.views-field-tid').first().text();
          var title = $(this).find('td.views-field-title, td.views-field-filename, td.views-field-name, td.views-field-author-byline').first().text();
          var viewMode = $.trim($(this).find('td.views-field-field-view-mode').first().text());
          entityId = am.trim(entityId);
          title = am.trim(title);
          if (contextFieldId) {
            am.attachAssetField(contextFieldId, assetType, entityId, title);
          }
          if (!contextFieldId && parent.currentActiveInstanceId != undefined && parent.currentActivePlugin != undefined) {
            if (viewMode == 'slideshow') {
              viewMode = 'slideshow_embed';
            }
            else if (viewMode == 'bigshots') {
              viewMode = 'bigshots_embed';
            }
            else {
              viewMode = '';
            }
            parent.currentActivePlugin.insertEntityIdToken(entityId,  entityType, parent.currentActiveInstanceId, viewMode);
          }
        });
        parent.jQuery.fn.colorbox.close();

      });
    },

    trim: function(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },

    attachAssetField: function(contextFieldId, assetType, entityId, title) {
      console.log(contextFieldId);
      if (contextFieldId) {
        var field = parent.jQuery('#' + contextFieldId);
        if (field.length > 0) {
          field.trigger({
            type: 'attachAssetField',
            assetType: assetType,
            entityId: entityId,
            title: title
          });
        }
      }
    }
  }
}(jQuery));