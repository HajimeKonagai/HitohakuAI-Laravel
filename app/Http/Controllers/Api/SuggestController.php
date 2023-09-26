<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SuggestionService;

class SuggestController extends Controller
{
    public function __invoke(Request $request)
    {
        return [
            'plant' => SuggestionService::suggestPlant(
                $request->input('en_name', ''),
                $request->input('ja_name', '')
            ),
            'address' => SuggestionService::suggestAddress(
                $request->input('ja_pref', ''),
                $request->input('ja_city', ''),
                $request->input('ja_addr', ''),
                $request->input('en_pref', ''),
                $request->input('en_city', ''),
                $request->input('en_addr', '')
            ),
            'date' => SuggestionService::suggestDate($request->input('date', null)),
        ];
    }
}
