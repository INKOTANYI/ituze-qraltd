<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'user_id',
        'type',
        'name',
        'registration_number',
        'contact_person',
        'email',
        'phone',
        'national_id',
        'address',
        'status',
    ];

    public function tenancies()
    {
        return $this->hasMany(Tenancy::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activeTenancies()
    {
        return $this->hasMany(Tenancy::class)->where('status', 'active');
    }
}
