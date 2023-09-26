<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Annotation;

class AnnotationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Annotation::class);
    }

    public function __invoke()
    {
        return Inertia::render('Annotation/Index', []);
    }

    public function index(Request $request)
    {
		$q = Annotation::query();
        if (!auth()->user()->can('is_admin'))
        {
            $q->where('user_id', auth()->id());
        }
        
        $appends = [];
        if ($request->word)
        {
            $q->where(function ($query) use ($request)
            {
                $query->where('text', 'LIKE', '%'.$request->word.'%');
                $query->orWhere('data', 'LIKE', '%'.$request->word.'%');
            });
            $appends['word'] = $request->word;
        }

        if ($request->code)
        {
            $q->Where('code', 'LIKE', '%'.$request->code.'%');
            $appends['code'] = $request->code;
        }

        // Log::info($request->process);
        if ($request->process)
        {
            $q->whereIn('entity_edited_as_2', $request->process);
            $appends['process'] = $request->process;
        }

        // Log::info($q->toSql());


		if ($request->order && $request->order_by)
		{
			$q->orderBy($request->order_by, $request->order);
		}

        /*
		return $q
			// ->groupBy($selects)
			// ->orderBy($orderBy)
			->paginate($request->perPage ?: static::$per_page);
            */


        return $appends ?
            $q->paginate(20)->withPath(route('annotation'))->appends($appends) :
            $q->paginate(20)->withPath(route('annotation'))
        ;
    }

    public function edit(Annotation $annotation)
    {
        $prev = Annotation::where('id', '<', $annotation->id)->orderBy('id', 'DESC')->first();
        $next = Annotation::where('id', '>', $annotation->id)->orderBy('id', 'ASC')->first();


        return Inertia::render('Annotation/Edit', [
            'data' => $annotation,
            'labels' => config('ai.labels'),
            'prev' => $prev,
            'next' => $next,
        ]);

    }
   
   
    public function update(Request $request, Annotation $annotation)
    {
        $annotation->entity_edited_as_2 = $request->entity_edited_as_2;
        $annotation->entities = $request->entities;
        $annotation->memo = $request->memo;
        $annotation->save();
    }
}
