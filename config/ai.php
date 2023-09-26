<?php

return [
    'google_ocr_url' => env('GOOGLE_OCR_URL', ''),
    'google_ocr_token' => env('GOOGLE_OCR_TOKEN', ''),

    'ner_ai_url' => env('NER_AI_URL', ''),
    'ner_ai_token' => env('NER_AI_TOKEN', ''),


    'labels' => [
        // 'code'      => ['shortcut'=> 90, 'name' => '標番'      , 'long_name' => '標本番号'],
        'en_family' => ['shortcut'=> 49, 'name' => 'Family'    , 'long_name' => '科名(英)'],
        'ja_family' => ['shortcut'=> 50, 'name' => '科名'      , 'long_name' => '科名(和)'],
        'en_name'   => ['shortcut'=> 51, 'name' => '学名'      , 'long_name' => '学名(英)'],
        'ja_name'   => ['shortcut'=> 52, 'name' => '種名'      , 'long_name' => '種名(和)'],
        'ja_pref'   => ['shortcut'=> 53, 'name' => '県名'      , 'long_name' => '採取地名: 都道府県(和)'],
        'ja_city'   => ['shortcut'=> 54, 'name' => '市郡町'    , 'long_name' => '採取地名: 市区町村(和)'],
        'ja_addr'   => ['shortcut'=> 55, 'name' => '以下'      , 'long_name' => '採取地名: 以下(和)'],
        'en_pref'   => ['shortcut'=> 56, 'name' => '県名(英)'  , 'long_name' => '採取地名: 都道府県(英)'],
        'en_city'   => ['shortcut'=> 57, 'name' => '市町(英)'  , 'long_name' => '採取地名: 市区町村(英)'],
        'en_addr'   => ['shortcut'=> 48, 'name' => '以下(英)'  , 'long_name' => '採取地名: 以下(英)'],
        'date'      => ['shortcut'=> 81, 'name' => '年月日'    , 'long_name' => '採取年月日'],
        'person'    => ['shortcut'=> 87, 'name' => '採集者'    , 'long_name' => '採集者'],
        'number'    => ['shortcut'=> 69, 'name' => '番号'      , 'long_name' => '採取者標本番号'],
        'country'   => ['shortcut'=> 82, 'name' => '国名'      , 'long_name' => '採取地名:国名'],
        'lat'       => ['shortcut'=> 65, 'name' => '緯度'      , 'long_name' => '緯度'],
        'lng'       => ['shortcut'=> 83, 'name' => '経度'      , 'long_name' => '経度'],
        'alt'       => ['shortcut'=> 68, 'name' => '標高'      , 'long_name' => '標高'],
        'memo'      => ['shortcut'=> 70, 'name' => '備考'      , 'long_name' => '備考'],
    ],
];