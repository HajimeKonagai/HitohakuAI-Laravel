<?php

namespace App\Services;
use Illuminate\Support\Facades\Log;
use App\Models\PlantDictionary;

class PlantDictionaryService
{
    public static function createSearch(PlantDictionary $plant)
    {
        $search = implode(' ', [
            $plant->name_code,
            $plant->family_code,
            $plant->ja_name,
            $plant->en_name,
            $plant->ja_family,
            $plant->en_family,
            $plant->kbn,
        ]);

        // 「ジ」と「ヂ」、「ズ」と「ヅ」、「オ」と「ヲ」
        $kana_replaces = [
            'ジ' => 'ヂ',
            'ヂ' => 'ジ',
            'ズ' => 'ヅ',
            'ヅ' => 'ズ',
            'オ' => 'ヲ',
            'ヲ' => 'オ',
        ];
        $ja_names = [$plant->ja_name];
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
        $ja_families = [$plant->ja_family];
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

        $search .= ' '.strtolower($plant->en_name).' '.mb_ereg_replace('[^a-zA-Z0-9\s]', '', strtolower($plant->en_name));
        $search .= ' '.strtolower($plant->en_family);

        return $search;
    }
}
