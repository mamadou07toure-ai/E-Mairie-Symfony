<?php
use Symfony\Component\Dotenv\Dotenv;
require 'vendor/autoload.php';

(new Dotenv())->bootEnv(__DIR__.'/.env');
$kernel = new \App\Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();

$loader = new \Twig\Loader\FilesystemLoader(__DIR__.'/templates');
$twig = new \Twig\Environment($loader, ['debug' => true]);
$twig->addExtension(new \Twig\Extension\DebugExtension());
$twig->addFilter(new \Twig\TwigFilter('date', function ($date, $format = 'd/m/Y') {
    if (!$date) return '';
    return date($format, strtotime($date));
}));

$types = [
    'ACTE_NAISSANCE' => [
        'template' => 'pdf/acte_naissance.html.twig',
        'data' => ["nom" => "Test", "prenom" => "Audit", "genre" => "M", "motif" => "Audit", "date_naissance" => "2020-01-01", "lieu_naissance" => "Conakry"]
    ],
    'CERTIFICAT_RESIDENCE' => [
        'template' => 'pdf/certificat_residence.html.twig',
        'data' => ["nom" => "Test", "prenom" => "Audit", "date_naissance" => "2020-01-01", "lieu_naissance" => "Conakry", "adresse" => "Kaloum", "quartier" => "Almamy", "motif" => "Audit"]
    ],
    'CERTIFICAT_MARIAGE' => [
        'template' => 'pdf/certificat_mariage.html.twig',
        'data' => ["nom_epoux" => "Mari", "prenom_epoux" => "Audit", "nom_epouse" => "Femme", "prenom_epouse" => "Audit", "date_mariage" => "2023-05-10", "lieu_mariage" => "Kaloum", "motif" => "Audit"]
    ],
    'LEGALISATION_DOCUMENT' => [
        'template' => 'pdf/legalisation_document.html.twig',
        'data' => ["nom" => "Test", "prenom" => "Audit", "type_document" => "Diplôme", "langue" => "Français", "usage_prevu" => "Emploi"]
    ],
    'BON_RETRAIT' => [
        'template' => 'pdf/bon_retrait.html.twig',
        'data' => ["nom" => "Test", "prenom" => "Audit"] // Also test the fallback logic
    ]
];

// Mock Demande for the templates
class MockUser { 
    public function getUuid() { return 'USR-AUDIT-123'; } 
    public function getTelephone() { return '622000000'; } 
    public function getNom() { return 'UserNom'; } 
    public function getPrenom() { return 'UserPrenom'; } 
}
class MockType { public function getLibelle() { return 'Type Audit'; } }
class MockDemande {
    public function getNumeroDossier() { return 'AUDIT-2026-0001'; }
    public function getId() { return 999; }
    public function getUuid() { return 'uuid-audit-999'; }
    public function getUser() { return new MockUser(); }
    public function getTypeDemande() { return new MockType(); }
}

$mockDemande = new MockDemande();

echo "Début de l'audit de génération PDF...\n";
echo str_repeat('-', 50) . "\n";

foreach ($types as $code => $config) {
    echo str_pad("Test [$code]", 35, ".");
    try {
        $html = $twig->render($config['template'], [
            'demande' => $mockDemande,
            'specific_data' => $config['data']
        ]);
        
        $options = new \Dompdf\Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isRemoteEnabled', true);
        $dompdf = new \Dompdf\Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        
        $pdfOutput = $dompdf->output();
        if (strlen($pdfOutput) > 1000) {
            echo " ✅ SUCCÈS (" . strlen($pdfOutput) . " octets)\n";
        } else {
            echo " ⚠️ AVERTISSEMENT (Fichier trop petit)\n";
        }
    } catch (\Exception $e) {
        echo " ❌ ERREUR: " . $e->getMessage() . "\n";
    }
}
echo str_repeat('-', 50) . "\n";
echo "Audit terminé.\n";
