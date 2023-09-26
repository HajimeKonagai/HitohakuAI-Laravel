<?php

namespace App\Console\Commands\Dev;

use Illuminate\Console\Command;
use Storage;
use DB;

class PickImage extends Command
{
    private static $full_image_dir_name = '/extdisk/images/full';
    private static $dev_annotation_table_name = 'dev_annotations';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:pick-image';

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
        $dev_annotations = DB::table(static::$dev_annotation_table_name)->get();

        dump($dev_annotations->count());
        foreach ($dev_annotations as $dev_annotation)
        {
                        // webp 形式で画像を保存 auality 75 ぐらいで
            $original_path = static::$full_image_dir_name.'/'.substr($dev_annotation->code, 0, -3).'xxx'.'/'.$dev_annotation->code.'.jpg';
            if (!file_exists($original_path))
            {
                dump($original_path);
            }

            $dirname = storage_path('data/original/'.$dev_annotation->priority);
            if (!file_exists($dirname)) mkdir($dirname, 0777, true);
            copy($original_path, $dirname.'/'.$dev_annotation->code.'.jpg');
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
