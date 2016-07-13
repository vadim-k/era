(function ($) {
  Drupal.behaviors.fusionAssetManagerClose = {
    attach: function(context, settings) {
      var am = Drupal.behaviors.fusionAssetManagerClose;
      var entityId = settings.fusionAssetManagerClose.entityId;
      var title = settings.fusionAssetManagerClose.title;
      var assetType = settings.fusionAssetManagerClose.assetType;
      var contextFieldId = settings.fusionAssetManagerClose.contextFieldId;
      if (entityId && title && contextFieldId) {
        am.attachAssetField(contextFieldId, assetType, entityId, title);
      }
      parent.jQuery.colorbox.close();
    },

    attachAssetField: function(contextFieldId, assetType, entityId, title) {
      if (contextFieldId) {
        var field = parent.jQuery('#' + contextFieldId);
        if (field.length > 0) {
          field.trigger({
            type: 'setAssetField',
            assetType: assetType,
            entityId: entityId,
            title: title
          });
        }
      }
    }
  }
}(jQuery));