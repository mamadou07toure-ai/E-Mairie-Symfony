<?php

namespace App\Enum;

enum TypeDocumentEnum: string
{
    case PIECE_JUSTIFICATIVE = 'piece_justificative';
    case DOCUMENT_GENERE = 'document_genere';

    public function label(): string
    {
        return match ($this) {
            self::PIECE_JUSTIFICATIVE => 'Pièce justificative',
            self::DOCUMENT_GENERE => 'Document généré',
        };
    }
}
