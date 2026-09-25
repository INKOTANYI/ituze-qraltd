<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'tenant_id',
        'assigned_by',
        'start_date',
        'end_date',
        'monthly_rent',
        'deposit_amount',
        'notes',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }
}
