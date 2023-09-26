<?php

namespace App\Console\Commands\TrainData;

use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Annotation;
use App\Models\PlantDictionary;
use App\Models\AddressDictionary;
use Faker;
use Storage;


class Sampling extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'train-data:sampling {count}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'サンプリングしたデータを作成';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = $this->argument('count');

        $faker = Faker\Factory::create('ja_JP');

        $training_data = [];


        $plant_id = 1;
        while (count($training_data) < $count)
        {
            $annotations = Annotation::inRandomOrder()
                ->where('entity_edited_as_2', 2)
                ->where('is_endangered', false) # 絶滅危惧種を除外
                ->limit($count)
                ->get();

            foreach ($annotations as $anno)
            {
                if (count($training_data) % 50 == 0) dump(count($training_data));
                $labels = config('ai.labels');
                $sample = [];
                foreach ($labels as $key => $label)
                {
                    $sample[$key] = '';
                }


                $plant = PlantDictionary::whereNotIn('ja_name', [ '', '-' ])
                    ->where('id', '<=', $plant_id)
                    ->orderBy('id', 'desc')
                    ->first();
                if ((!$plant) || $plant->id != $plant_id)
                {
                    $plant = PlantDictionary::whereNotIn('ja_name', [ '', '-' ])->inRandomOrder()->first();
                    # dump($plant_id.': '.$plant->id);
                }
                $plant_id++;

                $sample['en_family'] = $plant->en_family;
                $sample['ja_family'] = $plant->ja_family;
                $sample['en_name'] = $plant->en_name;
                $sample['ja_name'] = $plant->ja_name;
                $address = AddressDictionary::where('ja_addr', '!=', '以下に掲載がない場合')->inRandomOrder()->first();
                $sample['ja_pref'] = $address->ja_pref;
                $sample['ja_city'] = $address->ja_city;
                $sample['ja_addr'] = $address->ja_addr; // TODO: 精度が上がらなければサンプリング
                $sample['en_pref'] = $address->en_pref_no_pref;
                $sample['en_city'] = $address->en_city;
                $sample['en_addr'] = $address->en_addr;


                // date ランダム
                $sample['date'] = date(static::$date_format[array_rand(static::$date_format)], $faker->unixtime);

                // person サンプリング
                $sample['person'] = static::mbtrim($faker->name);

                // number サンプリング もしくは 999999 rand
                $sample['number'] = strval( rand(0, 99999) );

                // lat -90 - 90, lng -180 - 180
                $sample['lat'] = static::format_latlng($faker->latitude);
                $sample['lng'] = static::format_latlng($faker->longitude);
                // alt 1200 ぐらいまで
                $sample['alt'] = static::random_alt();


                foreach ($sample as $key => $val)
                {
                    $sample[$key] = static::mbtrim($val);
                }

                // eitities を昇順に並べ替え
                $entities = json_decode($anno->entities, true);
                usort($entities, function ($a, $b)
                {
                    return $a['span'][0] - $b['span'][0];
                });

                $str = '';
                $pos = 0;
                $new_entities = [];
                foreach ($entities as $entity)
                {
                    $str .= mb_substr($anno->text, $pos, ($entity['span'][0] - $pos));
                    $name = $sample[$entity['label']];
                    if (mb_strlen($name) < 1) continue;
                    $new_entities[] = [
                        'name' => $name,
                        'span' => [mb_strlen($str), mb_strlen($str)+mb_strlen($name)],
                        'label' => $entity['label'],
                    ];
                    $str .= $name;
                    $pos = $entity['span'][1];
                }

                /*
                foreach ([
                    'person',
                    'number',
                    'date',
                    'lat',
                    'lng',
                    'alt',
                ] as $l)
                {
                    unset($new_entities[$l]);
                }
                */

                $training_data[] = [
                    'text' => $str,
                    'entities' => $new_entities,
                ];


                if (count($training_data) >= $count) break;
            }
        }

        dump(count($training_data));
        Storage::disk('local')->put('training-data/sampling.json', json_encode($training_data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
    }


    // 全角スペースが前後に入ると、spacy でエラーになるので。
    private static function mbtrim($str)
    {
        return preg_replace("/(^\s+)|(\s+$)/u", "", trim($str));
    }

    private static function format_latlng($l)
    {
        $is_minus = $l < 0;
        $l = abs($l);
        $deg = floor($l);
        $min = floor(($l - $deg) * 60);
        $sec = (($l - $deg) * 60 - $min) * 60;

        $format = static::$latlng_formats[array_rand(static::$latlng_formats)];
        return ($is_minus ? '-':'').
            $deg.
            str_replace([
                'i', 
                's',
            ],
            [
                sprintf('%02d', $min),
                sprintf('%02.'.max(0, rand(0,10) - 7).'f', $sec),
            ],
            $format);
    }

    private static function random_alt()
    {
        $sep = [' ', '-', ' - ', '~', ' ~ '][rand(0,4)];
        $prefix = ['', 'c.', 'c. ', 'ca.', 'ca. '][rand(0,4)];
        // 適当な2桁までの数値
        $base = rand(0, 20);
        // 何桁あげるか
        $multi = 10 ^ rand(0, 2);

        $alt = $base * $multi;

        return (rand(0, 10) > 7 ? $prefix: '').
            ($base * $multi).
            (rand(0, 10) > 5 ? $sep.(($base+rand(1, 5))*$multi) : '');

    }

    private static $date_format = [
        'Y/n/j',
        'Y.n.j',
        'Y-n-j',
        'Y年n月j日',
        'F.j.Y',
        'F. j. Y',
        'F j Y',
        'F.j,Y',
        'F. j, Y',
        'M.j.Y',
        'M. j. Y',
        'M j Y',
        'M.j,Y',
        'M. j, Y',
        'Y/n/j.',
        'Y.n.j,',
        'Y-n-j',
        'Y年n月j日.',
        'F.j.Y,',
        'F. j. Y.',
        'F j Y',
        'F.j,Y.',
        'F. j, Y',
        'M.j.Y.',
        'M. j. Y',
        'M j Y,',
        'M.j,Y,',
        'M. j, Y',
        'Y 年 n 月 j 日',
        'j.F.Y',
        'j. F. Y',
        'j F Y',
        'j.F,Y',
        'j. F, Y',
        'j.M.Y',
        'j. M. Y',
        'j M Y',
        'j.M,Y',
        'j. M, Y',        
    ];

    private static $latlng_formats = [
        "度i分",
        "度i分s",
        " i",
        " i s",
        "°i",
        "° i",
        "°i's",
        "° i's",
        "° i' s",
        "'i",
        "' i",
        "'i's",
        "' i's",
        "' i' s",

        // 多めのものをここに
        "度i分",
        "度i分",
        "度i分",
        "° i",
        "° i",
        "' i",
        "' i",
        
    ];
}
