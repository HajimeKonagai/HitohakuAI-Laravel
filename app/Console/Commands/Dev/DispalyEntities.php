<?php

namespace App\Console\Commands\Dev;

use Illuminate\Console\Command;
use DB;
class DispalyEntities extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:dispaly-entities';

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
        $dev_annotations = DB::table('dev_annotations')->get();

        $i = 0;
        $csv = 'CODE,ja_name,en_name,ja_family,en_family'."\n";
        foreach ($dev_annotations as $dev_annotation)
        {
            $dev_plant = DB::table('dev_plants')
                ->where('code', $dev_annotation->code)
                ->first();
            $csv.= '"'.$dev_plant->code.'"'.",".'"'.$dev_plant->ja_name.'"'.",".'"'.$dev_plant->en_name.'"'.",".'"'.$dev_plant->ja_family.'"'.",".'"'.$dev_plant->en_family.'"';
            $csv.= $dev_annotation->entity_edited_as_2 == 2 ? ',"編集済み"' : ',""';
            $csv .= "\n";
        }

        file_put_contents(storage_path('data/plants.csv'), $csv);
    }
}
