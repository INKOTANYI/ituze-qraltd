<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'cell_id',
        'name',
        'address',
        'description',
        'amenities',
        'proximity',
    ];

    protected $casts = [
        'amenities' => 'array',
        'proximity' => 'array',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function cell()
    {
        return $this->belongsTo(Cell::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function tenancies()
    {
        return $this->hasManyThrough(Tenancy::class, Unit::class);
    }
}