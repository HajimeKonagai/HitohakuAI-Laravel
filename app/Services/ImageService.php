<?php

namespace App\Services;


use Illuminate\Support\Facades\Storage;
use \InterventionImage;
use Illuminate\Support\Facades\Log;

use App\Models\Plant;

class ImageService
{

	public static function fileExistsAll($path_or_filename, $save_to_path = null)
	{
        $exists = static::fileExists($path_or_filename, $save_to_path);
        return count($exists) == count(array_filter($exists, function ($v) { return $v; }));
	}

	public static function fileExists($path_or_filename, $save_to_path = null)
	{
        $files = static::files($path_or_filename, $save_to_path);
		$exists = [];
        foreach ($files as $size => $path)
        {
            $exists[$size] = file_exists($path) ? $path : null;
        }

		return $exists;
	}

	// ファイル名から3サイズのファイルのフルパスを返す。
	public static function files($path_or_filename, $save_to_path = null)
	{
		$filename = static::rawname($path_or_filename).'.webp';

		$files = [];

		$full_dir_name = config('hitohaku.full_dir_name');
		$large_size = config('hitohaku.large_size');
		$small_size = config('hitohaku.small_size');
        
		$full_dir = static::personalDir($filename, $full_dir_name, true, $save_to_path);
		$files[$full_dir_name] = $full_dir.'/'.$filename;

		$large_dir = static::personalDir($filename, $large_size, true, $save_to_path);
		$files[$large_size] = $large_dir.'/'.$filename;

		$small_dir = static::personalDir($filename, $small_size, true, $save_to_path);
		$files[$small_size] = $small_dir.'/'.$filename;

		return $files;
	}

    public static function personalDir($path, $size, $makedir = true, $save_to_path = null)
	{
		$to_dir = $save_to_path ? $save_to_path : Storage::disk('local')->path('webp');
		$rawname = static::rawname($path);
		$personal_dir = substr($rawname, 0, -3).'xxx';

		if (!is_dir($to_dir.'/'.$size)                   && $makedir) mkdir($to_dir.'/'.$size);
		if (!is_dir($to_dir.'/'.$size.'/'.$personal_dir) && $makedir) mkdir($to_dir.'/'.$size.'/'.$personal_dir);

		return $to_dir.'/'.$size.'/'.$personal_dir;
	}

	// 拡張子を返す
	public static function extension($path)
	{
		return pathinfo($path, PATHINFO_EXTENSION);
	}

	// 拡張子なしの名前のみ(パスもなし)を返す
	public static function rawname($path)
	{
		$ext = static::extension($path);
		$filename = basename($path);
		return str_replace('.'.$ext, '', $filename);
	}

    public static function toWebp($original_path)
    {
        $img = null;
        switch (image_type_to_mime_type(exif_imagetype($original_path)))
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

        if (!$img)
        {
            // TODO: Exception;
        }

        return $img;
    }

    public static function renameAll($original_path, $save_name = null, $save_to_path = null)
    {
        $img = static::toWebp($original_path);
 
        list($width, $height, $type, $attr) = getimagesize($original_path);
        // 回転
        if ($width > $height) $img = imagerotate($img, -90, 0);
        imagepalettetotruecolor($img);

        $save_file_paths = static::files($save_name ?: $original_path, $save_to_path);
        foreach ($save_file_paths as $size => $save_path)
        {
            // $thumb = imagecreatetruecolor($newwidth, $newheight);
            // リサイズ
            $resized = $img;
            if (is_int($size)) $resized = imagescale($img, $size);
            imagewebp($resized, $save_path, config('hitohaku.webp_quelity'));
        }

        if ($resized) imagedestroy($resized);
        imagedestroy($img);
    }

}