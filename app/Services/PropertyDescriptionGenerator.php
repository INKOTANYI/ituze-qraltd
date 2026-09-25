<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PropertyDescriptionGenerator
{
    private const BASIC_AMENITY_KEYS = ['parking', 'security', 'generator', 'water_tank', 'elevator', 'cleaning_service'];

    private const AMENITY_LABELS = [
        'wifi' => 'WiFi',
        'parking' => 'Parking',
        'gym' => 'Gym',
        'swimming_pool' => 'Swimming Pool',
        'restaurant' => 'Restaurant',
        'bar' => 'Bar',
        'security' => '24/7 Security',
        'generator' => 'Backup Generator',
        'water_tank' => 'Reserve Water Tank',
        'elevator' => 'Elevator / Lift',
        'cleaning_service' => 'Cleaning Services',
    ];

    private const PROXIMITY_LABELS = [
        'near_tarmac' => 'a paved tarmac road',
        'near_school' => 'top schools',
        'near_hospital' => 'major hospitals',
        'near_market' => 'vibrant markets',
        'near_public_transport' => 'public transport hubs',
    ];

    private function filterAmenitiesByType(array $amenityKeys, ?string $typeName): array
    {
        $isApartment = $typeName === 'Apartment';
        if ($isApartment) return $amenityKeys;
        return array_values(array_intersect($amenityKeys, self::BASIC_AMENITY_KEYS));
    }

    private function labelAmenities(array $amenityKeys): array
    {
        $out = [];
        foreach ($amenityKeys as $k) {
            $out[] = self::AMENITY_LABELS[$k] ?? ucwords(str_replace('_', ' ', $k));
        }
        return $out;
    }

    private function labelProximity(array $proxKeys): array
    {
        $out = [];
        foreach ($proxKeys as $k) {
            $out[] = self::PROXIMITY_LABELS[$k] ?? ucwords(str_replace('_', ' ', $k));
        }
        return $out;
    }
    public function generate(array $inputs): array
    {
        try {
            $apiKey = config('services.openai.api_key');
            $model = config('services.openai.model', 'gpt-4o-mini');

            if (empty($apiKey)) {
                Log::warning('AI description generation skipped: OpenAI API key not configured.');
                return $this->generateTemplate($inputs);
            }

            $systemPrompt = 'You are an expert SEO real estate copywriter for properties in Kigali, Rwanda. Rules: (1) Keep descriptions tight — 130 to 200 words max. (2) Match the tone strictly to the property type: Apartment = warm, residential, appealing to renters/families; Office = professional, business-focused, appealing to SMEs/startups and corporate tenants; Warehouse = logistics, secure loading, capacity-focused; Commercial = high foot traffic, retail/brand visibility. (3) Never use residential words ("home", "residents", "living", "family") for Office, Warehouse, or Commercial. (4) Do NOT invent missing details. (5) Structure: 1-sentence hook → 1 short structure/location sentence → 1 short amenities/nearby sentence → 1 soft CTA. Use short paragraphs, no bold headings.';

            $userPrompt = $this->buildUserPrompt($inputs);

            $response = Http::timeout(15)
                ->withToken($apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.7,
                ]);

            if (!$response->successful()) {
                Log::warning('AI description generation failed: OpenAI returned status ' . $response->status());
                return $this->generateTemplate($inputs);
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? null;

            if (empty($content)) {
                Log::warning('AI description generation failed: Empty content in response.');
                return $this->generateTemplate($inputs);
            }

            return [
                'description' => trim($content),
                'source' => 'llm',
            ];
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::warning('AI description generation failed: Connection timeout - ' . $e->getMessage());
            return $this->generateTemplate($inputs);
        } catch (\Exception $e) {
            Log::warning('AI description generation failed: ' . $e->getMessage());
            return $this->generateTemplate($inputs);
        }
    }

    private function buildUserPrompt(array $inputs): string
    {
        $lines = [];

        if (!empty($inputs['name'])) {
            $lines[] = "Property Name: {$inputs['name']}";
        }
        if (!empty($inputs['property_type_name'])) {
            $lines[] = "Property Type: {$inputs['property_type_name']}";
        }
        if (!empty($inputs['address'])) {
            $lines[] = "Address: {$inputs['address']}";
        }

        $locationParts = array_filter([
            $inputs['location_parts']['province'] ?? null,
            $inputs['location_parts']['district'] ?? null,
            $inputs['location_parts']['sector'] ?? null,
            $inputs['location_parts']['cell'] ?? null,
        ]);
        if (!empty($locationParts)) {
            $lines[] = 'Location (Province > District > Sector > Cell): ' . implode(' > ', $locationParts);
        }

        if (isset($inputs['total_units']) && $inputs['total_units'] !== '') {
            $lines[] = 'Total Units: ' . $inputs['total_units'];
        }
        if (isset($inputs['total_floors']) && $inputs['total_floors'] !== '') {
            $lines[] = 'Total Floors (including ground floor): ' . $inputs['total_floors'];
        }
        if (!empty($inputs['unit_size_range'])) {
            $lines[] = "Unit Size Range: {$inputs['unit_size_range']}";
        }

        $rawAmenities = $inputs['amenities'] ?? [];
        $filteredAmenities = $this->filterAmenitiesByType($rawAmenities, $inputs['property_type_name'] ?? null);
        $labeledAmenities = $this->labelAmenities($filteredAmenities);
        if (!empty($labeledAmenities)) {
            $lines[] = 'Amenities: ' . implode(', ', $labeledAmenities);
        }

        $rawProximity = $inputs['proximity'] ?? [];
        $labeledProximity = $this->labelProximity($rawProximity);
        if (!empty($labeledProximity)) {
            $lines[] = 'Close to (nearby landmarks/places): ' . implode(', ', $labeledProximity);
        }

        $prompt = "Please write a compelling 250-400 word property description for this listing in Kigali, Rwanda.\n\n";
        $prompt .= "Property details:\n" . implode("\n", $lines);
        $prompt .= "\n\nFocus on Kigali's unique appeal—cleanliness, safety, growing infrastructure—and make it feel like a desirable place to live or invest.";

        return $prompt;
    }

    public function generateTemplate(array $inputs): array
    {
        $name = trim($inputs['name'] ?? '') ?: 'This property';
        $typeRaw = $inputs['property_type_name'] ?? null;
        $type = $typeRaw ?: 'property';
        $address = trim($inputs['address'] ?? '') ?: null;

        $locationParts = array_values(array_filter([
            $inputs['location_parts']['sector'] ?? null,
            $inputs['location_parts']['district'] ?? null,
        ]));
        $locationLine = !empty($locationParts) ? implode(', ', $locationParts) : 'Kigali';
        $fullLocationPath = $address ? "{$locationLine} — {$address}" : $locationLine;

        $totalUnits = $inputs['total_units'] ?? null;
        $totalFloors = $inputs['total_floors'] ?? null;
        $unitSizeRange = $inputs['unit_size_range'] ?? null;

        $filteredAmenities = $this->filterAmenitiesByType($inputs['amenities'] ?? [], $typeRaw);
        $amenities = $this->labelAmenities($filteredAmenities);
        $proximity = $this->labelProximity($inputs['proximity'] ?? []);

        $structure = [];
        if ($totalUnits !== null && $totalUnits !== '') {
            $uw = (int)$totalUnits === 1 ? 'unit' : 'units';
            $structure[] = "{$totalUnits} {$uw}";
        }
        if ($totalFloors !== null && $totalFloors !== '') {
            $fw = (int)$totalFloors === 1 ? 'floor' : 'floors';
            $structure[] = "{$totalFloors} {$fw} (incl. ground)";
        }
        if ($unitSizeRange) {
            $structure[] = "sizes from {$unitSizeRange}";
        }
        $structureLine = !empty($structure) ? implode(' · ', $structure) : null;

        $amenList = !empty($amenities) ? implode(', ', $amenities) : null;
        $proxList = !empty($proximity) ? implode(', ', $proximity) : null;

        switch ($typeRaw) {
            case 'Office':
                $hook = "Presenting {$name} — a prime Office space in {$fullLocationPath}, designed for modern businesses and professional teams.";
                $who = 'SMEs, startups, and corporate teams';
                $benefit = 'benefit from Kigali’s business-friendly infrastructure and convenient connectivity across the city';
                $cta = 'Ideal for regional HQs, satellite offices, or co-working-style tenancies. Schedule a walkthrough today and find your team’s new address.';
                break;
            case 'Warehouse':
                $hook = "Introducing {$name} — a practical Warehouse in {$fullLocationPath}, built for reliable logistics and secure storage.";
                $who = 'Distributors, importers, and last-mile operators';
                $benefit = 'benefit from secure access and easy proximity to major routes across Kigali';
                $cta = 'Suitable for bulk storage, light assembly, or distribution hubs. Enquire today to secure the space your supply chain needs.';
                break;
            case 'Commercial':
                $hook = "Showcase your brand at {$name} — a Commercial property positioned in {$fullLocationPath}, Kigali.";
                $who = 'Retailers, showrooms, and service-based businesses';
                $benefit = 'benefit from strong visibility, footfall, and proximity to the city’s growing consumer areas';
                $cta = 'Perfect for shops, banks, showrooms, or service outlets. Book an inspection and position your brand for growth.';
                break;
            case 'Apartment':
            default:
                $hook = "Welcome to {$name} — a welcoming {$type} located in {$fullLocationPath}, Kigali.";
                $who = 'Young professionals, couples, and families';
                $benefit = 'enjoy Kigali’s clean, safe streets and growing amenities right on their doorstep';
                $cta = 'Whether you’re renting long-term or investing, this is Kigali living at its best. Schedule a viewing today.';
                break;
        }

        $lines = [];
        $lines[] = $hook;

        if ($structureLine) {
            $lines[] = "Offering {$structureLine} — well-proportioned spaces with natural light and room to grow.";
        } else {
            $lines[] = "Well-proportioned spaces with natural light and room to grow.";
        }

        $featParts = [];
        if ($amenList) $featParts[] = "amenities include {$amenList}";
        if ($proxList) $featParts[] = "close to {$proxList}";
        if (!empty($featParts)) {
            $lines[] = "Key " . implode(', and ', $featParts) . " — {$who} {$benefit}.";
        } else {
            $lines[] = "{$who} {$benefit}.";
        }

        $lines[] = $cta;

        $description = implode("\n\n", $lines);

        return [
            'description' => $description,
            'source' => 'template',
        ];
    }
}
