<?php

namespace App\Console\Commands\Init;

use Illuminate\Console\Command;
use App\Models\AddressDictionary as MainModel;

class AddressDictionary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init:address-dictionary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'storage/data/init/address-dict.csv で住所データベースを初期化';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        MainModel::truncate();

        $en_city_units = [
            'shi',
            'ku',
            'cho',
            'machi',
            'son',
            'mura',
            'gun',
        ];

        $filepath = storage_path('data/init/address-dict.csv');

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
            $en_city = strtolower($line[5]);
            foreach ($en_city_units as $unit)
            {
                $en_city = str_replace(' '.$unit, '-'.$unit, $en_city);
            }

            $en_city_arr = explode(' ', $en_city);
            if (count($en_city_arr) > 1)
            {
                if (count($en_city_arr) > 2)
                {
                    dump('市区町村がおかしい');
                    dump($en_city_arr);
                }
                $en_city = $en_city_arr[1].', '.$en_city_arr[0];
            }

            $bulks[] = [
                'zip' => $line[0],
                'ja_pref' => $line[1],
                'ja_city' => str_replace([' ', '　'], '', $line[2]),
                'ja_addr' => $line[3], // ほぼ一致しないので、そのまま入れておく
                'en_pref' => strtolower($line[4]),
                'en_city' => $en_city,
                'en_addr' => strtolower($line[6]), // ほぼ一致しないので、そのまま入れておく
                'ja_pref_no_pref' => str_replace(['東京都', '府', '県'], ['東京', '', ''], $line[1]),
                'en_pref_no_pref' => str_replace([' to', ' fu', ' ken'], ['', '', ''], strtolower($line[4])),
                'ja_city_spaced' => $line[2], // original
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
