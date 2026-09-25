<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitType extends Model
{
    protected $fillable = ['name'];

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}