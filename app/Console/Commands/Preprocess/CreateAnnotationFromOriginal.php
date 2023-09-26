<?php

namespace App\Console\Commands\Preprocess;

use Illuminate\Console\Command;
use App\Models\Annotation;
use Storage;

class CreateAnnotationFromOriginal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'preprocess:create-annotation-from-original {user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'storage/data/original 内のファイルから annotations のデータを生成する';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user_id = $this->argument('user_id');
        $dirs = [];
        
        $files = glob(storage_path('data/original/*'));

        $priority = 0;
        foreach ($files as $file)
        {

            if (is_dir($file))
            {
                $dirs[] = $file;
                continue;
            }
            break;

            $priority = 1;

            static::create_annotation($user_id, $file, $priority);
        }

        foreach ($dirs as $dir)
        {
            $files = glob($dir.'/*');
            if ($files)
            {
                $priority += 1;
                foreach ($files as $file)
                {
                    static::create_annotation($user_id, $file, $priority);
                }
            }
        }
    }

    private static function create_annotation($user_id, $file, $priority)
    {
        $imagetype = exif_imagetype($file);
        if(! ($imagetype == IMAGETYPE_JPEG || $imagetype == IMAGETYPE_PNG) )
        {
            dump('jpeg, png 形式ではありません: '. $file);
            return;
        }


        $pathinfo = pathinfo($file);
        $annotation = Annotation::create([
            'process_id' => 0,
            'text' => null,
            'entities' => json_encode([]), // $plant->entities,
            'data' => json_encode([]),
            'code' => $pathinfo['filename'],
            'priority' => $priority,
            'user_id' => $user_id,
        ]);



        $image = $imagetype == IMAGETYPE_JPEG ? imagecreatefromjpeg($file): imagecreatefrompng($file);

        $dirname = Storage::disk('public')->path('annotation/'.$user_id);
        if (!file_exists($dirname)) mkdir($dirname, 0777, true);
        imagepalettetotruecolor($image);
        // imagealphablending($img, true);
        // imagesavealpha($img, true);
        imagewebp($image, $dirname.'/' . $annotation->id . '.webp', 75);
    }
}
