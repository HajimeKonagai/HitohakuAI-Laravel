<?php

namespace App\Console\Commands\TrainData;

use Illuminate\Console\Command;
use App\Models\Annotation;
use Storage;

class Create extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'train-data:create {user_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '作業済みから教師データ生成';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user_id = $this->argument('user_id');

        $annotations = Annotation::where('entity_edited_as_2', 2)
            ->where('user_id', $user_id)
            ->where('is_endangered', false) # 絶滅危惧種を除外
            ->inRandomOrder()
            ->get();

        $data = [];
        foreach ($annotations as $annotation)
        {
            $entities = json_decode($annotation->entities, true);
            foreach ($entities as $k => $e)
            {
                if (strpos($e['label'], 'en_') !== false) continue;
                
                $er = rtrim($e['name'], '.');
                $er = rtrim($er, ',');
                $er = rtrim($er, '\n');
                if ($er != $e['name'])
                {
                    $entities[$k]['name'] = $er;
                    $entities[$k]['span'][1] = $entities[$k]['span'][0] + mb_strlen($er);
                }
            }
            $data[] = [
                'text' => $annotation->text,
                'entities' => $entities,
            ];
        }

        dump(count($data));
        
        Storage::disk('local')->put('training-data/annotation.json', json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
    }
}
