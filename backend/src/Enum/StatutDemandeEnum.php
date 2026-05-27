<?php

namespace App\Enum;

enum StatutDemandeEnum: string
{
    case EN_ATTENTE = 'en_attente';
    case EN_COURS = 'en_cours';
    case DOCUMENT_MANQUANT = 'document_manquant';
    case VALIDEE = 'validee';
    case REJETEE = 'rejetee';
    case REMISE = 'remise';

    public function label(): string
    {
        return match ($this) {
            self::EN_ATTENTE => 'En attente',
            self::EN_COURS => 'En cours',
            self::DOCUMENT_MANQUANT => 'Document manquant',
            self::VALIDEE => 'Validée',
            self::REJETEE => 'Rejetée',
            self::REMISE => 'Remise au guichet',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::EN_ATTENTE => '#64748B',
            self::EN_COURS => '#1D4ED8',
            self::DOCUMENT_MANQUANT => '#C2410C',
            self::VALIDEE => '#15803D',
            self::REJETEE => '#B91C1C',
            self::REMISE => '#6D28D9',
        };
    }
}
