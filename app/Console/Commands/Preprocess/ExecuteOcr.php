<?php

namespace App\Console\Commands\Preprocess;

use Illuminate\Console\Command;
use App\Models\Annotation;
use App\Services\GoogleOcrService;

class ExecuteOcr extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'preprocess:execute-ocr';

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
        $annotations = Annotation::whereNull('text')
            ->get();

        dump(count($annotations));

        foreach ($annotations as $annotation)
        {
            $image_path = storage_path('app/public/annotation/'.$annotation->user_id.'/'.$annotation->id.'.webp');

            $text = GoogleOcrService::ocr($image_path);

            $annotation->text = $text;
            $annotation->save();
        }
    }
}
