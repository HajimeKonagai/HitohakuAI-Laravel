<?php
namespace App\Services;


use Google\Cloud\Vision\V1\ImageAnnotatorClient;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;


class GoogleOcrService
{
    public static function ocr($path)
    {
        $client = new ImageAnnotatorClient();

        $image = $client->createImageObject(file_get_contents($path));

        $response = $client->textDetection($image);

        if(!is_null($response->getError())) {

            return false;

        }

        $annotations = $response->getTextAnnotations();
        $description = $annotations[0]->getDescription();

        return $description;
    }
}