<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'unit_type_id',
        'unit_number',
        'rent_amount',
        'size_sqm',
        'description',
        'status',
    ];

    protected $casts = [
        'rent_amount' => 'decimal:2',
        'size_sqm' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function unitType()
    {
        return $this->belongsTo(UnitType::class);
    }
}