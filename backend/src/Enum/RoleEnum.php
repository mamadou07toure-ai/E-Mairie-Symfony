<?php

namespace App\Enum;

enum RoleEnum: string
{
    case CITOYEN = 'citoyen';
    case AGENT = 'agent';
    case ADMINISTRATEUR = 'administrateur';

    public function label(): string
    {
        return match ($this) {
            self::CITOYEN => 'Citoyen',
            self::AGENT => 'Agent Mairie',
            self::ADMINISTRATEUR => 'Administrateur',
        };
    }

    public function symfonyRole(): string
    {
        return 'ROLE_' . strtoupper($this->value);
    }
}
