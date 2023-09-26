<?php

namespace App\Services;

use App\Models\Log;

/*
Log::emergency("emergency ログ!");
Log::alert("alert ログ!");
Log::critical("critical ログ!");
Log::error("error ログ!");
Log::warning("warning ログ!");
Log::notice("notice ログ!");
Log::info("info ログ!");
Log::debug("debug ログ!");

success
*/

class LogService
{
    public static function info($job, $content, $code = null)
    {
    }

    public static function error($job, $content, $code = null)
    {
    }
}