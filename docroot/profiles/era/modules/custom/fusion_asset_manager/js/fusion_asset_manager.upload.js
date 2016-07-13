(function ($) {
  Drupal.behaviors.fusionAssetManagerUpload = {
    attach: function(context, settings) {
      var am = Drupal.behaviors.fusionAssetManagerUpload;
      var up = $('.asset-manager .plupload-element').pluploadQueue();
      up.settings.multipart_params = up.multipart_params || {};
      up.settings.multipart_params.data = up.settings.multipart_params.data || {};

      $('.asset-manager').on('click', '#edit-add-files', function(e) {
        e.preventDefault();
        am.storeFields(up);
        $('.moxie-shim-html5 input[type=file]').trigger('click');
      });

      $('.asset-manager').on('click', '#edit-start-upload', function(e) {
        e.preventDefault();
        var errorOccured = false;
        am.storeFields(up);

        if (up.files.length > 0) {
          // check for errors
          plupload.each(up.files.reverse(), function(file) {
            var fileRow = $('#' + file.id);
            var fileCssClass = am.makeSafeForCSS(file.name);
            fileRow.find('.asset-field').removeClass('field-error');
            fileRow.find('.messages').remove();
            
            $(fileRow.find('.asset-field').get().reverse()).each(function() {
              if ($(this).hasClass('required') && !$(this).find('input[type=text], textarea').val()) {
                $(this).addClass('field-error');
                errorOccured = true;
                up.trigger('Error', {code: 100500, message: $(this).find('label').text() + ' is required.', file: file});
              }
            });
          });

          if (!errorOccured) {
            $('input:text:first').focus();
            up.start();
          }
          else {
            $('.field-error input[type=text][value=""]:first, .field-error textarea:empty:first').eq(0).focus();
          }
        }
      });
    },

    storeFields: function(up) {
      if (up.files.length > 0) {
        plupload.each(up.files.reverse(), function(file) {
          up.settings.multipart_params.data[file.id] = {
            title: $('#' + file.id + '_title').val(),
            credit:  $('#' + file.id + '_credit').val(),
            caption:  $('#' + file.id + '_caption').val(),
            //internal_caption:  $('#' + file.id + '_internal_caption').val()
          };
          $('.asset-manager input[name=data]').val(JSON.stringify(up.settings.multipart_params.data));
        });
      }
    },

    makeSafeForCSS: function(name) {
      return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
      });
    },

    update: function(up) {
      var am = Drupal.behaviors.fusionAssetManagerUpload;
      var field_optional = Drupal.settings.fusionAssetManager.make_image_title_optional;
      plupload.each(up.files, function(file) {
        var fileRow = $('#' + file.id);
        var fileCssClass = am.makeSafeForCSS(file.name);
        fileRow.addClass(fileCssClass);
        fileRow.append('<div class="asset-row"><div class="preview"></div><div class="asset-fields"></div><div class="clearfix"></div><div class="plupload_file_progress"><div class="plupload_file_progress_container"><div class="plupload_file_progress_bar"></div></div></div></div>');
        
        var title = file.name.replace(/\.[^/.]+$/, "");
        var credit = '';
        var caption = '';
        //var internalCaption = '';
        if (typeof up['settings']['multipart_params']['data'][file.id] !== "undefined") {
          title = up['settings']['multipart_params']['data'][file.id]['title'];
          credit = up['settings']['multipart_params']['data'][file.id]['credit'];
          caption = up['settings']['multipart_params']['data'][file.id]['caption'];
          //internalCaption = up['settings']['multipart_params']['data'][file.id]['internal_caption'];
        }
        var required_class='required';
        var asterisk_symb='*';
        if(field_optional){ 
          required_class = '';
          asterisk_symb = '';
        }
        fileRow.find('.asset-fields').append('<div class="asset-field title '+ required_class +'"><label for="' + file.id + '_title">Title</label> <span class="asterisk">'+asterisk_symb+'</span><input name="title" id="' + file.id + '_title" type="text" value="' + title + '"></div>');     
        fileRow.find('.asset-fields').append('<div class="asset-field credit '+ required_class +'"><label for="' + file.id + '_credit">Credit</label> <span class="asterisk">'+asterisk_symb+'</span><input name="credit" id="' + file.id + '_credit"  value="' + credit + '" type="text"></div>');
        fileRow.find('.asset-fields').append('<div class="asset-field caption '+ required_class +'"><label for="' + file.id + '_caption">Display Caption</label> <span class="asterisk">'+asterisk_symb+'</span><textarea name="caption" id="' + file.id + '_caption">' + caption + '</textarea></div>');
        //fileRow.find('.asset-fields').append('<div class="asset-field internal-caption"><label for="' + file.id + '_internal_caption">Internal Caption</label><textarea name="internal_caption" id="' + file.id + '_internal_caption">' + internalCaption + '</textarea></div>');
        
        var img = new mOxie.Image();
        img.onload = function() {
          this.embed(fileRow.find('.preview').get(0), {
            width: 100,
            height: 100
          });
        };
        
        img.onembedded = function() {
          this.destroy();
        };
        img.onerror = function() {
          this.destroy();
        };
        img.load(file.getSource());
      });
    },

    init: function (up) {
      var winHeight = $(window).height();
      var uploaderHeight = winHeight - (Math.round((winHeight / 100)) * 15);
      $('.asset-manager ul.plupload_filelist').height(uploaderHeight);
      up.refresh();
      $('.asset-manager .upload-buttons').show();
    },
    
    filesAdded: function (up, files) {
      var am = Drupal.behaviors.fusionAssetManagerUpload;
      am.update(up);
      $('.asset-field.required input[type=text][value=""]:first, .asset-field.required textarea:empty:first').eq(0).focus();
    },

    filesRemoved: function (up, files) {
      var am = Drupal.behaviors.fusionAssetManagerUpload;
      am.update(up);
    },
    
    uploadComplete: function (up, files) {
      $('#edit-save').trigger('click');
    },

    uploadProgress: function (up, file) {
      fileRow = $('#' + file.id);
      fileRow.find('.plupload_file_progress_bar').css('width', file.percent + '%');
      if (file.percent == 100) {
        fileRow.find('.plupload_file_progress').fadeOut(200, function() {
          fileRow.hide();
        });
      }
    },
    
    error: function (up, args) {
      var am = Drupal.behaviors.fusionAssetManagerUpload;
      if (args.file != undefined) {
        var fileCssClass = am.makeSafeForCSS(args.file.name);
        var fileRow = $('.' + fileCssClass);
        if (fileRow.length == 0) {
          fileRow = $('#' + args.file.id);
          fileRow.addClass(fileCssClass);
        }
        fileRow.find('.messages').remove();
        fileRow.prepend('<div class="messages error">' + args.message + '</div>');
      }
    }

  }
}(jQuery));