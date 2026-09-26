<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyInquiry;
use App\Services\WhatsAppCloudService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class PublicPropertyController extends Controller
{
    public function show(Property $property): Response
    {
        $property->load([
            'images',
            'owner:id,name,first_name,last_name,phone',
            'cell.sector.district.province',
            'units' => fn ($query) => $query->where('status', 'available')->with('unitType'),
        ]);

        abort_if($property->units->isEmpty(), 404);

        return Inertia::render('Public/Property', [
            'property' => $property,
        ]);
    }

    public function inquire(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'visitor_name' => ['required', 'string', 'max:120'],
            'visitor_email' => ['nullable', 'email', 'max:255'],
            'visitor_phone' => ['required', 'string', 'max:40'],
            'message' => ['required', 'string', 'max:2000'],
            'channel' => ['required', 'in:message,whatsapp'],
        ]);

        $unit = $property->units()
            ->where('status', 'available')
            ->when($validated['unit_id'] ?? null, fn ($query, $unitId) => $query->whereKey($unitId))
            ->with('unitType')
            ->first();

        if (!$unit) {
            return back()->withErrors(['unit_id' => 'That available space is no longer listed. Please refresh and try again.']);
        }

        $inquiry = PropertyInquiry::create([
            ...$validated,
            'unit_id' => $unit->id,
            'property_id' => $property->id,
            'owner_id' => $property->owner_id,
        ]);

        $owner = $property->owner;
        $whatsappMessage = implode("\n", [
            'New Ituze rental inquiry',
            "Property: {$property->name}",
            "Unit: {$unit->unit_number} ({$unit->unitType?->name})",
            "From: {$inquiry->visitor_name}",
            "Phone: {$inquiry->visitor_phone}",
            "Email: " . ($inquiry->visitor_email ?: 'Not provided'),
            "Message: {$inquiry->message}",
        ]);

        try {
            if (!$owner?->phone) {
                throw new RuntimeException('The property owner does not have a WhatsApp phone number.');
            }

            app(WhatsAppCloudService::class)->sendText($owner->phone, $whatsappMessage);
            $inquiry->forceFill(['whatsapp_sent_at' => now(), 'status' => 'new'])->save();
        } catch (RuntimeException $exception) {
            $inquiry->forceFill(['whatsapp_error' => $exception->getMessage()])->save();
            Log::warning('Property inquiry WhatsApp delivery failed.', [
                'inquiry_id' => $inquiry->id,
                'error' => $exception->getMessage(),
            ]);

            return back()->with('warning', 'Your inquiry was saved for the owner, but WhatsApp delivery is currently unavailable.');
        }

        return back()->with('success', 'Your inquiry was sent to the property owner.');
    }
}
