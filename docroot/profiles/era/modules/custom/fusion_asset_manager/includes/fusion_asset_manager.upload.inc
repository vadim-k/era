<?php
/**
 * Image upload form.
 */
function fusion_asset_manager_upload_form($form, &$form_state) {
  $form['#attached']['js'] = array(
    drupal_get_path('module', 'fusion_asset_manager') . '/js/fusion_asset_manager.upload.js',
  );
  $form['#attached']['css'] = array(
    drupal_get_path('module', 'fusion_asset_manager') . '/css/fusion_asset_manager.upload.css',
  );

  $form['upload'] = array(
    '#type' => 'fieldset',
    '#collapsible' => FALSE,
    '#prefix' => '<div class="asset-manager">',
    '#suffix' => '</div>',
  );

  $form['upload']['context_field_id'] = array(
    '#type' => 'value',
    '#value' => arg(4),
  );

  $form['upload']['buttons'] = array(
    '#type' => 'fieldset',
    '#collapsible' => FALSE,
    '#attributes' => array('class' => array('upload-buttons')),
  );

  $form['upload']['buttons']['add_files'] = array(
    '#type' => 'button',
    '#value' => 'Add Files',
  );

  $form['upload']['buttons']['start_upload'] = array(
    '#type' => 'button',
    '#value' => 'Start Upload',
  );

  $form['upload']['buttons']['save'] = array(
    '#type' => 'submit',
    '#value' => 'Save',
    '#attributes' => array('class' => array('hidden')),
  );

  $form['upload']['data'] = array(
    '#type' => 'hidden',
  );

  $form['upload']['files'] = array(
    '#type' => 'plupload',
    '#title' => t(''),
    '#description' => t(''),
    '#autoupload' => FALSE,
    '#autosubmit' => TRUE,
    '#descriptoin' => '',
    '#upload_validators' => array(
      'file_validate_extensions' => array('jpg jpeg gif png'),
    ),
    '#plupload_settings' => array(
      'runtimes' => 'html5',
      'chunk_size' => '10mb',
      'prevent_duplicates' => TRUE,
    ),
    '#event_callbacks' => array(
      'Init' => 'Drupal.behaviors.fusionAssetManagerUpload.init',
      'FilesAdded' => 'Drupal.behaviors.fusionAssetManagerUpload.filesAdded',
      'FilesRemoved' => 'Drupal.behaviors.fusionAssetManagerUpload.filesRemoved',
      'UploadComplete' => 'Drupal.behaviors.fusionAssetManagerUpload.uploadComplete',
      'UploadProgress' => 'Drupal.behaviors.fusionAssetManagerUpload.uploadProgress',
      'Error' => 'Drupal.behaviors.fusionAssetManagerUpload.error',
    ),
  );

  return $form;
}

/**
 * Handles image file upload form submission.
 */
function fusion_asset_manager_upload_form_submit($form, &$form_state) {
  $items = array();
  $uploaded_files_data = !empty($form_state['values']['data']) ? drupal_json_decode($form_state['values']['data']) : NULL;
  $uploaded_files = !empty($form_state['values']['files']) ? $form_state['values']['files'] : NULL;
  $context_field_id = $form_state['values']['context_field_id'];
  if ($uploaded_files_data && $uploaded_files) {
    foreach ($uploaded_files as $uploaded_file) {
      if ($uploaded_file['status'] == 'done') {
        $file_data_key = str_replace('.tmp', '', $uploaded_file['tmpname']);
        $data = isset($uploaded_files_data[$file_data_key]) ? $uploaded_files_data[$file_data_key] : NULL;
        $file_info = pathinfo($uploaded_file['name']);
        $source = $uploaded_file['tmppath'];
        
        $directory_uri = file_build_uri('/' . date('Y/m/d'));
        file_prepare_directory($directory_uri, FILE_CREATE_DIRECTORY);

        $filename = !empty($data['title']) ? $data['title'] : $uploaded_file['name'];
        $filename = fusion_asset_manager_normalize_file_name($filename, $file_info['extension']);
        $data['filename'] = $filename;

        $destination = file_stream_wrapper_uri_normalize($directory_uri . '/' . $filename);
        $destination = file_unmanaged_move($source, $destination, FILE_EXISTS_RENAME);
        $file = plupload_file_uri_to_object($destination);
        $file->filename = $data['title'];
        $file->credit = $data['credit'];
        $file->caption = $data['caption'];
        file_save($file);

        $items[] = array(
          'context_field_id' => $context_field_id,
          'entityId' => $file->fid,
          'title' => $file->filename ,
          'imgSrc' => image_style_url('tn', $file->uri),
        );
      }
    }
  }

  $form_state['rebuild'] = TRUE;

  $module_path = drupal_get_path('module', 'fusion_asset_manager');
  drupal_add_js($module_path . '/js/fusion_asset_manager.upload_complete.js');
  $settings = array();
  $settings['items'] = $items;
  $settings['contextFieldId'] = $context_field_id;
  drupal_add_js(array('fusionAssetManagerUploadComplete' => $settings), 'setting');
}
