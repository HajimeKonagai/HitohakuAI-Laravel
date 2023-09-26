<?php

namespace App\Console\Commands\Init;

use Illuminate\Console\Command;
use App\Models\PlantDictionary as MainModel;

class PlantDictionary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init:plant-dictionary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'storage/data/init/plant-dict.csv で植物図鑑の初期化';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        MainModel::truncate();

        $filepath = storage_path('data/init/plant-dict.csv');

        $file = new \SplFileObject($filepath);
        $file->setFlags(
            \SplFileObject::READ_CSV | 
                \SplFileObject::READ_AHEAD |
                \SplFileObject::SKIP_EMPTY |
                \SplFileObject::DROP_NEW_LINE 
        );
        $bulks = [];
        foreach ($file as $line)
        {
            $search = implode(' ', $line);
            // 「ジ」と「ヂ」、「ズ」と「ヅ」、「オ」と「ヲ」
            $kana_replaces = [
                'ジ' => 'ヂ',
                'ヂ' => 'ジ',
                'ズ' => 'ヅ',
                'ヅ' => 'ズ',
                'オ' => 'ヲ',
                'ヲ' => 'オ',
            ];
            $ja_names = [$line[1]];
            foreach ($kana_replaces as $needle => $rep)
            {
                foreach ($ja_names as $ja_name)
                {
                    $replaced = str_replace($needle, $rep, $ja_name);
                    if ($ja_name != $replaced && !in_array($replaced, $ja_names))
                    {
                        $ja_names[] = $replaced;
                    }
                }
            }
            if (count($ja_names) > 1)
            {
                $search .= ' '.implode(' ', array_slice($ja_names, 1));
            }
            $ja_families = [$line[4]];
            foreach ($kana_replaces as $needle => $rep)
            {
                foreach ($ja_families as $ja_family)
                {
                    $replaced = str_replace($needle, $rep, $ja_family);
                    if ($ja_family != $replaced && !in_array($replaced, $ja_families))
                    {
                        $ja_families[] = $replaced;
                    }
                }
            }
            if (count($ja_families) > 1)
            {
                $search .= ' '.implode(' ', array_slice($ja_families, 1));
            }

            $search .= ' '.strtolower($line[2]).' '.mb_ereg_replace('[^a-zA-Z0-9\s]', '', strtolower($line[2]));
            $search .= ' '.strtolower($line[5]);

            $bulks[] = [
                's_name_code' => $line[0],
                'ja_name' => $line[1],
                'en_name' => $line[2],
                'f_code' => $line[3],
                'ja_family' => $line[4],
                'en_family' => $line[5],
                'search' => $search,
                'kbn' => $line[6],
            ];

            if (count($bulks) == 250)
            {
                MainModel::insert($bulks);
                $bulks = [];
            }
        }

        if ($bulks)
        {
            MainModel::insert($bulks);
        }
    }
}
