(function ($) {
  Drupal.behaviors.fusionAssetManagerUploadComplete = {
    attach: function(context, settings) {
      var am = Drupal.behaviors.fusionAssetManagerUploadComplete;
      var items = settings.fusionAssetManagerUploadComplete.items;
      var contextFieldId = settings.fusionAssetManagerUploadComplete.contextFieldId;
      var entityIds = [];
      for (i in items) {
        entityIds.push(items[i].entityId);
        if (contextFieldId) {
          am.attachAssetField(contextFieldId, items[i].entityId, items[i].title);
        }
      }
      if (!contextFieldId && parent.currentActiveInstanceId != undefined && parent.currentActivePlugin != undefined) {
        parent.currentActivePlugin.insertEntityIdToken(entityIds, parent.currentActiveInstanceId);
      }
      parent.jQuery.fn.colorbox.close();
    },

    attachAssetField: function(contextFieldId, entityId, title) {
      if (contextFieldId) {
        var field = parent.jQuery('#' + contextFieldId);
        if (field.length > 0) {
          field.trigger({
            type: 'attachAssetField',
            entityId: entityId,
            title: title
          });
        }
      }
    }
  }
}(jQuery));