<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Data;
use Storage;
use Log;

class DataController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Data::class);
    }


    public function __invoke()
    {
        return Inertia::render('Data/Index', [
            'labels' => config('ai.labels'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Data/Editor', [
            'item' => null,
            'labels' => config('ai.labels'),
            'google_ocr_url' => config('ai.google_ocr_url'),
            'google_ocr_token' => config('ai.google_ocr_token'),
            'ner_ai_url' => config('ai.ner_ai_url'),
            'ner_ai_token' => config('ai.ner_ai_token'),
        ]);
    }

    public function bulk()
    {
        return Inertia::render('Data/Bulk', [
            'labels' => config('ai.labels'),
            'google_ocr_url' => config('ai.google_ocr_url'),
            'google_ocr_token' => config('ai.google_ocr_token'),
            'ner_ai_url' => config('ai.ner_ai_url'),
            'ner_ai_token' => config('ai.ner_ai_token'),
        ]);

    }

    public function edit(Data $data)
    {
        return Inertia::render('Data/Editor', [
            'item' => $data,
            'labels' => config('ai.labels'),
            'google_ocr_url' => config('ai.google_ocr_url'),
            'google_ocr_token' => config('ai.google_ocr_token'),
            'ner_ai_url' => config('ai.ner_ai_url'),
            'ner_ai_token' => config('ai.ner_ai_token'),
        ]);
    }


    /**
     * APIs
     */

    public function search(Request $request)
    {
        $route = '/';

        $result = static::_search($request);
        $q = $result['q'];
        $appends = $result['appends'];

        return $appends ?
            $q->paginate(20)->withPath(route($route))->appends($appends) :
            $q->paginate(20)->withPath(route($route))
        ;
    }


    public function all(Request $request)
    {
        $route = '/';

        $result = static::_search($request);
        $q = $result['q'];

        return $q->get();
    }


    // all の作るので
    private static function _search(Request $request)
    {
	    $q = Data::query();

        if (!auth()->user()->can('is_admin'))
        {
            $q->where('user_id', auth()->id());
        }

        $appends = [];

        if ($request->text)
        {
            $q->where(function ($query) use ($request)
            {
                $query->where('code', 'LIKE', '%'.$request->text.'%');
                foreach (config('ai.labels') as $label => $val)
                {
                    $query->orWhere($label, 'LIKE', '%'.$request->text.'%');
                }
            });
            $appends['text'] = $request->text;
        }

        if ($request->label && $request->value)
        {
            $q->Where($request->label, 'LIKE', '%'.$request->value.'%');
            $appends['label'] = $request->label;
            $appends['value'] = $request->value;
        }

        if ($request->date_from)
        {
            $q->where('created_at', '>=', $request->date_from);
            $appends['date_from'] = $request->date_from;
        }

        if ($request->date_to)
        {
            $q->where('created_at', '<=', date('Y-m-d 12:59:59', strtotime($request->date_to)));
            $appends['date_to'] = $request->date_to;
        }

		if ($request->order && $request->order_by)
		{
			$q->orderBy($request->order_by, $request->order);
		}
        else
        {
            $q->orderBy('id', 'desc');
        }

        return [
            'q' => $q,
            'appends' => $appends,
        ];
    }


    public function view(Data $data)
    {
        return $data;
    }

    public function save(Request $request, Data $data)
    {
        Log::info($request->text);
        if (!$data) $data = new Data();
        $data->fill($request->all());
        $data->user_id = auth()->id();
        $data->save();

        if ($request->hasFile('file'))
        {
            $original_path = $request->file('file')->path();
            $mime = $request->file('file')->getMimeType();
            $date_dir = date('Y-m');
            $dirname = Storage::disk('public')->path($date_dir);
            if (!file_exists($dirname)) mkdir($dirname, 0755, true);
            Log::info($original_path);
            $img = null;
            switch ($mime)
            {
            case 'image/png':
                $img = imagecreatefrompng($original_path);
                break;
            case 'image/jpeg':
                $img = imagecreatefromjpeg($original_path);
                break;
                break;
            }
            imagepalettetotruecolor($img);
            // TODO: uniqid で名前がかぶらないように
            $filename = $data->id . '.jpg';
            imagejpeg($img, $dirname.'/' . $filename, 50);

            $data->file_path = $date_dir . '/' . $data->id.'.jpg';
            $data->save();
        }

        return $data;

        $dir = date('Y-m');
        $dirname = Storage::disk('public')->path($dir);
        if (!file_exists($dirname)) mkdir($dirname, 0755, true);
        // imagepalettetotruecolor($file);
        $filename = $d->id.'.jpg';
        file_put_contents($dirname.'/' . $filename, $file);
    }




    public function upload(Request $request)
    {
        // tmp に画像を保存
        // update での画像の変更は受け付けない。
        // TODO: 月ごとのフォルダを作成
        $original_path = $request->file('file')->path();
        $mime = $request->file('file')->getMimeType();
        $dirname = Storage::disk('public')->path('tmp');
        if (!file_exists($dirname)) mkdir($dirname, 0755, true);
        Log::info($original_path);
        $img = null;
        switch ($mime)
        {
        case 'image/png':
            $img = imagecreatefrompng($original_path);
            break;
        case 'image/jpeg':
            $img = imagecreatefromjpeg($original_path);
            break;
        case 'image/webp':
            $img = imagecreatefromwebp($original_path);
            break;
        }
        imagepalettetotruecolor($img);
        // TODO: uniqid で名前がかぶらないように
        $filename = uniqid() . '.jpg';
        imagejpeg($img, $dirname.'/' . $filename, 75);

        return [
            'name' => '/tmp/'.$filename,
            'url' => url('/storage/tmp/'.$filename),
        ];


        /*
        // webp 形式で画像を保存 auality 75 ぐらいで
        $original_path = static::$full_path.'/'.substr($plant->number, 0, -3).'xxx'.'/'.$plant->number.'.jpg';
        dump($original_path);
        if (!file_exists($original_path))
        {
            dump('ファイルが見つからない');
            continue;
        }
        // imagealphablending($img, true);
        // imagesavealpha($img, true);
        imagewebp($img, $dirname.'/' . $annotation->id . '.webp', 75);
        */
    }

    public function delete(Data $data)
    {
        $data->delete();
    }

}