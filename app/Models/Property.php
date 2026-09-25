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
        'property_type_id',
        'name',
        'address',
        'description',
        'status',
        'total_units',
        'total_floors',
        'bedrooms',
        'bathrooms',
        'size_sqm',
        'rent_amount',
        'amenities',
        'proximity',
    ];

    protected $casts = [
        'total_units' => 'integer',
        'total_floors' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'size_sqm' => 'decimal:2',
        'rent_amount' => 'decimal:2',
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

    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}