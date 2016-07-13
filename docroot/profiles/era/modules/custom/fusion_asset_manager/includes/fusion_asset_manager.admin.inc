<?php
/**
 * @file Admin settings file for Fusion Video.
 */

/**
 * Menu hook callback for the Fusion Video Settings page.
 */
function fusion_asset_manager_admin_settings() {
  $form['asset_make_image_title_optional'] = array(
    '#type' => 'checkbox',
    '#title' => 'Make image title and caption field optional',
    '#default_value' => variable_get('asset_make_image_title_optional', 0),
  );

  return system_settings_form($form);
}