<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\GoogleOcrService;

use Log;

class OcrController extends Controller
{
    public function __invoke(Request $request)
    {
        // post されたファイル
        $image = $request->file('image');

        if (!$image) return response()->json('error', 500);

        $imagetype = exif_imagetype($image);
        if(! ($imagetype == IMAGETYPE_JPEG || $imagetype == IMAGETYPE_PNG) )
        {
            return response()->json('jpeg, png 形式ではありません', 500);
            dump('jpeg, png 形式ではありません: '. $file);
            return;
        }

        $text = GoogleOcrService::ocr($image);

        return $text;
    }
}
