<?php

namespace App\Services;

use App\Models\PlantDictionary;
use App\Models\AddressDictionary;

use Log;
class SuggestionService
{
    public static function suggestPlant(
        $en_name,
        $ja_name
    )
    {
        if (!$en_name && !$ja_name) return [];

        // 完全一致で取得
        $q = PlantDictionary::query();
        if ($en_name && $ja_name) $q->where('en_name', $en_name)->orWhere('ja_name', $ja_name);
        elseif ($en_name) $q->where('en_name', $en_name);
        elseif ($ja_name) $q->where('ja_name', $ja_name);
        $results = $q->limit(5)->get();

        if (!$results->isEmpty()) // 両方入力がなくてもすべて返すのでよしとする
        {
            return $results;
        }

        // 和名はカタカナのみに
        $ja_name = trim(mb_convert_kana($ja_name, 'KCV'));
        // 完全一致でなかったら、英名を英数のみに
        $en_name = trim(mb_ereg_replace('[^a-zA-Z0-9\s]', '', strtolower($en_name)));

        $q = PlantDictionary::query();
        if ($en_name && $ja_name) $q->where('search', 'LIKE', '%'.$en_name.'%')
            ->orWhere('ja_name', 'LIKE', '%'.$ja_name.'%');
        elseif ($en_name) $q->where('search', 'LIKE', '%'.$en_name.'%');
        elseif ($ja_name) $q->where('search', 'LIKE', '%'.$ja_name.'%');
        $results = $q->limit(5)->get();

        return $results;
    }

    // city -> addr -> pref の順で、見つかったものを優先、5件までで返す。
    public static function suggestAddress(
        $ja_pref = '',
        $ja_city = '',
        $ja_addr = '',
        $en_pref = '',
        $en_city = '',
        $en_addr = ''
    )
    {
        $ja_pref = str_replace([' ', '　'],  '%', $ja_pref);
        $ja_city = str_replace([' ', '　'],  '%', $ja_city);
        $ja_addr = str_replace([' ', '　'],  '%', $ja_addr);
        $en_pref = str_replace([' ', '　'],  '%', $en_pref);
        $en_city = str_replace([' ', '　'],  '%', $en_city);
        $en_addr = str_replace([' ', '　'],  '%', $en_addr);

        $max_results = 5;
        $suggest_results = [];

        // まずは addr で検索
        if ($ja_addr || $en_addr)
        {
            $q = AddressDictionary::query();
            if ($ja_addr && $en_addr) {
                $q->where(function ($q) use($ja_addr, $en_addr)
                {
                    $q->where('ja_addr', 'LIKE', '%'.$ja_addr.'%')->orWhere('en_addr', 'LIKE', '%'.$en_addr.'%');
                });
            }
            elseif ($ja_addr) $q->where('ja_addr', $ja_addr);
            elseif ($en_addr) $q->where('en_addr', $en_addr);

            if ($ja_city) $q->where('ja_city', 'LIKE', '%'.$ja_city.'%');
            if ($en_city) $q->where('en_city', 'LIKE', '%'.$en_city.'%');

            $results = $q->limit($max_results - count($suggest_results))->get();
            foreach ($results as $result) $suggest_results[] = $result;
        }

        if (count($suggest_results) >= $max_results) return $suggest_results;


        if (
            ! $ja_pref &&
            ! $ja_city &&
            ! $en_pref &&
            ! $en_city
        )
        {
            return [];
        }

        // 次に city で検索 LIKE
        if ($ja_city || $en_city)
        {
            $groupBy = ['ja_pref', 'ja_city', 'en_pref', 'en_city'];
            $q = AddressDictionary::query();
            if ($ja_city && $en_city)
            {
                $q->where(function ($q) use($ja_city, $en_city)
                {
                    $q->where('ja_city', 'LIKE', '%'.$ja_city.'%')->orWhere('en_city', 'LIKE', '%'.$en_city.'%');
                });
            }
            elseif ($ja_city) $q->where('ja_city', 'LIKE', '%'.$ja_city.'%');
            elseif ($en_city) $q->where('en_city', 'LIKE', '%'.$en_city.'%');

            if ($ja_pref) $q->where('ja_pref', 'LIKE', '%'.$ja_pref.'%');
            if ($en_pref) $q->where('en_pref', 'LIKE', '%'.$en_pref.'%');

            $results = $q->limit($max_results - count($suggest_results))
                ->select($groupBy)
                ->groupBy($groupBy)
                ->get();
            foreach ($results as $result) $suggest_results[] = $result;
        }

        if (count($suggest_results) >= $max_results) return $suggest_results;

        // 最後に県で
       if ($ja_pref || $en_pref)
       {
           $groupBy = ['ja_pref', 'en_pref'];
           $q = AddressDictionary::query();
           if ($ja_pref && $en_pref)
           {
               $q->where(function ($q) use($ja_pref, $en_pref)
               {
                   $q->where('ja_pref', 'LIKE', '%'.$ja_pref.'%')->orWhere('en_pref', 'LIKE', '%'.$en_pref.'%');
               });
           }
           elseif ($ja_pref) $q->where('ja_pref', 'LIKE', '%'.$ja_pref.'%');
           elseif ($en_pref) $q->where('en_pref', 'LIKE', '%'.$en_pref.'%');

           $results = $q->limit($max_results - count($suggest_results))
               ->select($groupBy)
               ->groupBy($groupBy)
               ->get();
           foreach ($results as $result) $suggest_results[] = $result;
       }

       // 最後は全て返す
        return $suggest_results;

    }


    // TODO: 日付のフォーマットを指定できるように
    public static function suggestDate($date)
    {
        if (!$date) return [];

        $results = [];

        $time = strtotime($date);
        if ($time) $results[] = date('Y-m-d', $time);

        // 数字とアルファベットをスペース以外をハイフンに
        $date = trim(mb_ereg_replace('[^a-zA-Z0-9\s]', '-', strtolower($date)));
        // 行頭と行末は取り除く
        $date = trim(mb_ereg_replace('^[^a-zA-Z0-9\s]*', '', strtolower($date)));
        $date = trim(mb_ereg_replace('[^a-zA-Z0-9\s]$', '', strtolower($date)));
        // 最後にスペースを除去する
        $date = trim(mb_ereg_replace('[\s]', '', strtolower($date)));
        $time = strtotime($date);
        if ($time && ! in_array( date('Y-m-d', $time), $results)) $results[] = date('Y-m-d', $time);

        return $results;

        /*
        $reg_day = '/\s*(?:[12][0-9]|3[01]|0?[1-9])\s*(?:th\s*)?[日\/\-\.,]?/';
        $reg_month = '/month\s*\'\s*(?:(?:1[0-2]|0?[1-9])\s*[月\/\-\.,]?|(?:Jan(?:uary|\.)?|Feb(?:ruary|\.)?|Mar(?:ch|\.)?|Apr(?:il|\.)?|May\.?|Jun[e|\.]?|Jul[y|\.]?|Aug(?:ust|\.)?|Sep(?:tember|\.)?|Oct(?:ober|\.)?|Nov(?:ember|\.)?|Dec(?:ember|\.)?)\s*)\'/';
        $reg_year = '/\s*(?:\d{4}|[\'"]?\d{2})\s*[年\-\/\.,]?/';

        preg_match_all($reg_year, $date, $matches);
        dump($matches);
        preg_match_all($reg_month, $date, $matches);
        dump($matches);
        preg_match_all($reg_day, $date, $matches);
        dump($matches);
        preg_match_all($reg_day, $date, $matches);
        dump($matches);
        // それ以外は正規表現で一致を探していく
        */
    }

    public static function suggestLatLng($input)
    {
        if (!$input) return null;
        
        $input = trim($input);

        if (is_numeric($input))
        {
            $extract = static::latlng_to_degrees( $input );
        }
        else
        {
            $extract = static::extract($input);
        }


        // if ($extract) return static::degrees_to_latlng($extract['degrees'], $extract['minutes'], $extract['seconds']);
        if ($extract) return $extract['degrees'].'°'.$extract['minutes']."'".$extract['seconds'];

        return null;
    }


    public static function latlng_to_degrees($latlng) {
        $degrees = intval($latlng);
        $minutes = intval(($latlng - $degrees) * 60);
        $seconds = ($latlng - $degrees - ($minutes / 60)) * 3600;
        
        return array('degrees' => $degrees, 'minutes' => $minutes, 'seconds' => $seconds);
    }
    
    public static function degrees_to_latlng($degrees, $minutes, $seconds) {
        $latlng = $degrees + ($minutes / 60) + ($seconds / 3600);
        
        return $latlng;
    }

    public static function extract_degrees_minutes_seconds($input_string)
    {
        $pattern = "/([0-9０-９]+)[°|度]\s*([0-9０-９]+)['|分]\s*([0-9０-９]+(?:\.[0-9０-９]+)?)秒*/u";
 
        preg_match($pattern, $input_string, $matches);
        if (count($matches) === 4){
            $degrees = intval($matches[1]);
            $minutes = intval($matches[2]);
            $seconds = floatval($matches[3]);
            return array('degrees' => $degrees, 'minutes' => $minutes, 'seconds' => $seconds);
        } else {
            return null; // 時分秒が見つからない場合はnullを返す
        }
    }


    public static function extract_degrees_minutes($input_string)
    {
        $pattern = "/([0-9０-９]+)[°|度]\s*([0-9０-９]+)['|分]*/u";
 
        preg_match($pattern, $input_string, $matches);
        if (count($matches) === 3){
            $degrees = intval($matches[1]);
            $minutes = intval($matches[2]);
            $seconds = 0;
            return array('degrees' => $degrees, 'minutes' => $minutes, 'seconds' => $seconds);
        } else {
            return null; // 時分秒が見つからない場合はnullを返す
        }
    }

    public static function extract_degrees($input_string)
    {
        $pattern = "/([0-9０-９]+)[°|度]*/u";
 
        preg_match($pattern, $input_string, $matches);
        if (count($matches) === 2){
            $degrees = intval($matches[1]);
            $minutes = 0;
            $seconds = 0;
            return array('degrees' => $degrees, 'minutes' => $minutes, 'seconds' => $seconds);
        } else {
            return null; // 時分秒が見つからない場合はnullを返す
        }
    }

    public static function extract($input_string)
    {
        if ($result = static::extract_degrees_minutes_seconds($input_string))
        {
            return $result;
        }
        else if ($result = static::extract_degrees_minutes($input_string))
        {
            return $result;
        }
        else if ($result = static::extract_degrees($input_string))
        {
            return $result;
        }

        return null;
    }

}
