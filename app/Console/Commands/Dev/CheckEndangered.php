<?php

namespace App\Console\Commands\Dev;

use Illuminate\Console\Command;
use App\Models\Annotation;

class CheckEndangered extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:check-endangered';

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
        $filepath = storage_path('data/plant_endangered.csv');

                $file = new \SplFileObject($filepath);
        $file->setFlags(
            \SplFileObject::READ_CSV | 
                \SplFileObject::READ_AHEAD |
                \SplFileObject::SKIP_EMPTY |
                \SplFileObject::DROP_NEW_LINE 
        );
        $bulks = [];
        foreach ($file as $i => $line)
        {
            if ($i == 0) continue;

            if ($line[6])
            {
                $code = $line[0];
                $annotation = Annotation::where('code', $code)->first();
                if (!$annotation)
                {
                    dump($code);
                }
                $annotation->is_endangered = true;
                $annotation->save();
            }
        }
    }
}
