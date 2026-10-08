<?php
return [
 'name' => env('APP_NAME', 'Sort Adventure'), 'env' => env('APP_ENV', 'production'),
 'debug' => (bool) env('APP_DEBUG', false), 'url' => env('APP_URL', 'http://localhost'),
 'timezone' => 'UTC', 'locale' => 'ro', 'fallback_locale' => 'en', 'faker_locale' => 'ro_RO',
 'cipher' => 'AES-256-CBC', 'key' => env('APP_KEY'), 'previous_keys' => [],
 'maintenance' => ['driver' => 'file'],
];
