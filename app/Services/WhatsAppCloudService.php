<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppCloudService
{
    public function sendText(string $recipient, string $message): void
    {
        $phoneNumberId = config('services.whatsapp.phone_number_id');
        $token = config('services.whatsapp.access_token');
        $version = config('services.whatsapp.graph_version', 'v22.0');

        if (!$phoneNumberId || !$token) {
            throw new RuntimeException('WhatsApp Cloud API is not configured.');
        }

        $recipient = preg_replace('/[^\d]/', '', $recipient);

        if (!$recipient) {
            throw new RuntimeException('The WhatsApp recipient phone number is invalid.');
        }

        $response = Http::withToken($token)
            ->acceptJson()
            ->post("https://graph.facebook.com/{$version}/{$phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $recipient,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $message,
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('WhatsApp Cloud API returned an error: ' . $response->body());
        }
    }
}
