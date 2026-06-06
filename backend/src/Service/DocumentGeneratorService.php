<?php

namespace App\Service;

use App\Entity\Demande;
use App\Entity\DocumentTemplate;
use App\Repository\DocumentTemplateRepository;
use Dompdf\Dompdf;
use Dompdf\Options;

class DocumentGeneratorService
{
    public function __construct(
        private DocumentTemplateRepository $templateRepository,
        private string $projectDir
    ) {}

    /**
     * Generate a PDF from the active DocumentTemplate for the given demande.
     * Returns raw binary PDF content.
     *
     * @throws \RuntimeException if no active template exists or image is missing
     */
    public function generer(Demande $demande): string
    {
        $typeDemande = $demande->getTypeDemande();
        if (!$typeDemande) {
            throw new \RuntimeException('Aucun type de demande associé.');
        }

        $template = $this->templateRepository->findActiveForTypeDemande($typeDemande->getId());
        if (!$template) {
            throw new \RuntimeException('Aucun modèle actif pour ce type de demande.');
        }

        $imagePath = $this->projectDir . '/public/uploads/templates/' . basename($template->getCheminImage());
        if (!file_exists($imagePath)) {
            throw new \RuntimeException('Image du modèle introuvable : ' . $imagePath);
        }

        $mime     = mime_content_type($imagePath) ?: 'image/jpeg';
        $imageB64 = base64_encode(file_get_contents($imagePath));
        $imageDataUri = "data:{$mime};base64,{$imageB64}";

        $donnees = $this->extraireDonnees($demande);
        $html    = $this->construireHtml($template, $imageDataUri, $donnees);

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);
        $options->set('chroot', $this->projectDir . '/public');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    private function construireHtml(DocumentTemplate $template, string $imageDataUri, array $donnees): string
    {
        $champsHtml = '';
        foreach ($template->getChamps() ?? [] as $champ) {
            $key      = $champ['key']       ?? '';
            $x        = (float)($champ['x'] ?? 0);
            $y        = (float)($champ['y'] ?? 0);
            $fontSize = (int)($champ['font_size'] ?? 12);
            $bold     = !empty($champ['bold']);
            $color    = $champ['color'] ?? '#000000';
            $valeur   = htmlspecialchars($donnees[$key] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8');

            $fontWeight = $bold ? 'bold' : 'normal';
            $champsHtml .= <<<HTML
            <div style="
                position: absolute;
                left: {$x}%;
                top: {$y}%;
                font-size: {$fontSize}pt;
                font-weight: {$fontWeight};
                color: {$color};
                white-space: nowrap;
                line-height: 1;
            ">{$valeur}</div>
HTML;
        }

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 210mm; height: 297mm; overflow: hidden; }
    .page {
        position: relative;
        width: 210mm;
        height: 297mm;
        overflow: hidden;
    }
    .bg-image {
        position: absolute;
        top: 0; left: 0;
        width: 210mm;
        height: 297mm;
        object-fit: fill;
    }
</style>
</head>
<body>
    <div class="page">
        <img class="bg-image" src="{$imageDataUri}" />
        {$champsHtml}
    </div>
</body>
</html>
HTML;
    }

    private function extraireDonnees(Demande $demande): array
    {
        $user  = $demande->getUser();
        $agent = $demande->getAgent();

        $donnees = [
            'numero_dossier'   => $demande->getNumeroDossier() ?? '',
            'date_depot'       => $demande->getCreatedAt()?->format('d/m/Y') ?? '',
            'date_validation'  => $demande->getDateCloture()?->format('d/m/Y') ?? date('d/m/Y'),
            'citoyen_prenom'   => $user?->getPrenom() ?? '',
            'citoyen_nom'      => $user?->getNom() ?? '',
            'agent_prenom'     => $agent?->getPrenom() ?? '',
            'agent_nom'        => $agent?->getNom() ?? '',
            'type_demande'     => $demande->getTypeDemande()?->getLibelle() ?? '',
        ];

        $typeCode = $demande->getTypeDemande()?->getCode();

        switch ($typeCode) {
            case 'ACTE_NAISSANCE':
                $n = $demande->getDemandeNaissance();
                if ($n) {
                    $donnees = array_merge($donnees, [
                        'nom'              => $n->getNom() ?? '',
                        'prenoms'          => $n->getPrenoms() ?? '',
                        'date_naissance'   => $n->getDateNaissance()?->format('d/m/Y') ?? '',
                        'lieu_naissance'   => $n->getLieuNaissance() ?? '',
                        'genre'            => $n->getGenre() ?? '',
                        'nom_pere'         => $n->getNomPere() ?? '',
                        'prenom_pere'      => $n->getPrenomPere() ?? '',
                        'profession_pere'  => $n->getProfessionPere() ?? '',
                        'nom_mere'         => $n->getNomMere() ?? '',
                        'prenom_mere'      => $n->getPrenomMere() ?? '',
                        'profession_mere'  => $n->getProfessionMere() ?? '',
                        'nombre_copies'    => (string)($n->getNombreCopies() ?? 1),
                        'motif'            => $n->getMotif() ?? '',
                    ]);
                }
                break;

            case 'CERTIFICAT_RESIDENCE':
                $r = $demande->getDemandeResidence();
                if ($r) {
                    $donnees = array_merge($donnees, [
                        'nom'               => $r->getNom() ?? '',
                        'prenoms'           => $r->getPrenoms() ?? '',
                        'date_naissance'    => $r->getDateNaissance()?->format('d/m/Y') ?? '',
                        'lieu_naissance'    => $r->getLieuNaissance() ?? '',
                        'adresse_complete'  => $r->getAdresseComplete() ?? '',
                        'quartier_commune'  => $r->getQuartierCommune() ?? '',
                        'duree_residence'   => $r->getDureeResidence() ?? '',
                        'nombre_copies'     => (string)($r->getNombreCopies() ?? 1),
                        'motif'             => $r->getMotif() ?? '',
                    ]);
                }
                break;

            case 'CERTIFICAT_MARIAGE':
                $m = $demande->getDemandeMariage();
                if ($m) {
                    $donnees = array_merge($donnees, [
                        'nom_epoux'      => $m->getNomEpoux() ?? '',
                        'prenom_epoux'   => $m->getPrenomEpoux() ?? '',
                        'nom_epouse'     => $m->getNomEpouse() ?? '',
                        'prenom_epouse'  => $m->getPrenomEpouse() ?? '',
                        'date_mariage'   => $m->getDateMariage()?->format('d/m/Y') ?? '',
                        'lieu_mariage'   => $m->getLieuMariage() ?? '',
                        'nombre_copies'  => (string)($m->getNombreCopies() ?? 1),
                        'motif'          => $m->getMotif() ?? '',
                    ]);
                }
                break;

            case 'LEGALISATION_DOCUMENT':
                $l = $demande->getDemandeLegalisation();
                if ($l) {
                    $donnees = array_merge($donnees, [
                        'nom'            => $l->getNom() ?? '',
                        'prenoms'        => $l->getPrenoms() ?? '',
                        'motif'          => $l->getUsagePrevu() ?? '',
                        'nombre_copies'  => (string)($l->getNombreCopies() ?? 1),
                    ]);
                }
                break;
        }

        // Merge donnees_formulaire for any custom fields captured at submission
        $formulaire = $demande->getDonneesFormulaire() ?? [];
        foreach ($formulaire as $k => $v) {
            if (!isset($donnees[$k]) && is_scalar($v)) {
                $donnees[$k] = (string)$v;
            }
        }

        return $donnees;
    }
}
