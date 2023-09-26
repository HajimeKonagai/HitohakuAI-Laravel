<?php

namespace App\Services;


use Illuminate\Support\Facades\Log;

use App\Models\Plant;

class AiNerService
{
    public static function ner($text)
    {
        $post_data = [
            'token' => env('AI_TOKEN'),
            'text' => $text,
        ];
        $result = CurlService::post($post_data, $url = env('AI_URL'), $port = env('AI_PORT'));

        return $result;
    }
}
