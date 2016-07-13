<?php
/**
 * Adds asset manager info.
 */
function hook_fusion_asset_manager_info() {
  $info['image'] = array(
    'label' => 'Image',
    'attach_path' => '/admin/assets/images',
    'add_path' => '/admin/assets/upload/image',
    'attach_button' => TRUE,
    'add_button' => TRUE,
    'attach_link' => TRUE,
    'edit_link' => TRUE,
    'clone_link' => TRUE,
    'crop_link' => TRUE,
    'clear_link' => TRUE,
  );
  return $info;
}

/**
 * Adds item data for based on $asset_type and $entity_id.
 */
function hook_fusion_asset_manager_item_data_alter(&$data, $asset_type, $entity_id, $reference_entity_id = NULL) {
  if ($asset_type == 'nodequeue') {
    $image = fusion_author_get_image($entity_id);
    if ($image) {
      $data['img_src'] = image_style_url('tn', $image->uri);
      $data['title'] = $image->title;
    }
  }
}
