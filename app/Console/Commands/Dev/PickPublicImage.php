<?php

namespace App\Console\Commands\Dev;

use Illuminate\Console\Command;
use App\Models\Annotation;

class PickPublicImage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:pick-public-image';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $annotations = Annotation::where('is_endangered', false) # 絶滅危惧種を除外
            ->where('entity_edited_as_2', 2)
            ->get();


        dump($annotations->count());
        foreach ($annotations as $annotation)
        {
                        // webp 形式で画像を保存 auality 75 ぐらいで
            $original_path = storage_path('data/_original/'.$annotation->priority.'/'.$annotation->code.'.jpg');
            if (!file_exists($original_path))
            {
                dump($original_path);
            }

            $dirname = storage_path('data/public_images/');
            if (!file_exists($dirname)) mkdir($dirname, 0777, true);
            copy($original_path, $dirname.'/'.$annotation->code.'.jpg');
            /*
            $img = imagecreatefromjpeg($original_path);
            imagepalettetotruecolor($img);
            // imagealphablending($img, true);
            // imagesavealpha($img, true);
            imagewebp($img, $dirname.'/' . $annotation->id . '.webp', 75);
            */
        }
    }
}
