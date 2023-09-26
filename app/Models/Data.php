<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Data extends Model
{
    use HasFactory;

    protected $guarded = [ 'id', 'created_at', 'updatedat' ];

    protected $casts = [
    ];


    protected $appends = ['created_str'];

    public function getCreatedStrAttribute()
    {
        return date('Y-m-d H:i:s', strtotime($this->created_at));
    }
}
